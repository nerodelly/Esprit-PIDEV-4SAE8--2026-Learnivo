package com.learnivo.claimsservice.controller;

import com.learnivo.claimsservice.dto.*;
import com.learnivo.claimsservice.entity.Claim;
import com.learnivo.claimsservice.repository.ClaimRepository;
import com.learnivo.claimsservice.service.AiAnalysisService;
import com.learnivo.claimsservice.service.AiAnalysisService.SentimentResult;
import com.learnivo.claimsservice.service.EmailService;
import com.learnivo.claimsservice.service.RabbitMQService;
import com.learnivo.claimsservice.service.SseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
@Slf4j
public class ClaimController {

    private final ClaimRepository claimRepository;
    private final AiAnalysisService aiAnalysisService;
    private final EmailService emailService;
    private final SseService sseService;
    private final RabbitMQService rabbitMQService;

    private static final Set<String> ALL_STATUSES =
            Set.of("CREATED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED");

    // ── Health ────────────────────────────────────────────────────────────────

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    // ── List all claims (paginated + search) ──────────────────────────────────

    @GetMapping
    public ResponseEntity<PageResponse<ClaimResponse>> getAllClaims(
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "")   String search) {

        PageRequest pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Claim> result = claimRepository.findAllWithSearch(search, pageable);
        return ResponseEntity.ok(toPageResponse(result, page, limit));
    }

    // ── List claims by student email ──────────────────────────────────────────

    @GetMapping("/student/{email}")
    public ResponseEntity<PageResponse<ClaimResponse>> getClaimsByStudent(
            @PathVariable String email,
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "")   String search) {

        PageRequest pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Claim> result = claimRepository.findByStudentEmail(email, search, pageable);
        return ResponseEntity.ok(toPageResponse(result, page, limit));
    }

    // ── Create claim ──────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<?> createClaim(@Valid @RequestBody ClaimRequest request) {

        String combinedText = request.getSubject() + " " + request.getDescription();

        // 1. Run AI analysis
        SentimentResult analysis = aiAnalysisService.analyzeSentiment(combinedText);

        String status       = "CREATED";
        String adminResponse = null;

        // 1a. Auto-categorization
        String finalCategory = (request.getCategory() == null ||
                request.getCategory().isBlank() ||
                "General".equals(request.getCategory()))
                ? analysis.predictedCat()
                : request.getCategory();

        // 1b. Auto-assignment
        String assignedTo = aiAnalysisService.assignAgent(finalCategory);

        // 1c. SLA deadline
        LocalDateTime slaDeadline = aiAnalysisService.calculateSLADeadline(analysis.priority());

        // 2. Bad words filter
        String priority  = analysis.priority();
        String sentiment = analysis.sentiment();
        String aiSuggestion = analysis.suggestedResponse();

        if (aiAnalysisService.containsBadWords(combinedText)) {
            status       = "REJECTED";
            priority     = "LOW";
            sentiment    = "NEGATIVE";
            adminResponse = "Your claim violated our community guidelines and inappropriate language policies. " +
                            "It has been automatically rejected.";
            aiSuggestion  = "🛑 Auto-Rejected: Profanity or abusive language detected in the claim.";
        } else {
            // 3. Duplicate / similarity check (last 7 days)
            try {
                LocalDateTime since = LocalDateTime.now().minusDays(7);
                List<Claim> recentClaims = claimRepository.findRecentClaims(since);
                double maxSimilarity = 0;
                Long duplicateId = null;

                for (Claim rc : recentClaims) {
                    double sim = aiAnalysisService.calculateSimilarity(
                            combinedText, rc.getSubject() + " " + rc.getDescription());
                    if (sim > maxSimilarity) {
                        maxSimilarity = sim;
                        duplicateId = rc.getId();
                    }
                }

                if (maxSimilarity > 0.45) {
                    aiSuggestion += String.format(
                            "\n\n⚠️ Potential Duplicate Alert! High similarity to previous claim #%d. " +
                            "Check if this is a widespread issue.", duplicateId);
                }
            } catch (Exception e) {
                log.warn("Similarity check warning: {}", e.getMessage());
            }
        }

        // Persist
        Claim claim = Claim.builder()
                .studentName(request.getStudentName())
                .studentEmail(request.getStudentEmail())
                .subject(request.getSubject())
                .description(request.getDescription())
                .category(finalCategory)
                .status(status)
                .priority(priority)
                .sentiment(sentiment)
                .aiSuggestion(aiSuggestion)
                .adminResponse(adminResponse)
                .assignedTo(assignedTo)
                .slaDeadline(slaDeadline)
                .escalated(false)
                .escalationCount(0)
                .build();

        claim = claimRepository.save(claim);

        // Email notifications
        final SentimentResult finalAnalysis = new SentimentResult(
                priority, sentiment, analysis.urgencyScore(), analysis.sentimentScore(),
                aiSuggestion, analysis.predictedCat(), analysis.aiDraft()
        );

        if ("CREATED".equals(status)) {
            emailService.sendNewClaimEmail(claim, finalAnalysis);
        } else {
            // Auto-rejected — notify student
            emailService.sendStatusChangeEmail(claim, status, adminResponse);
        }

        // Publish to RabbitMQ
        if ("CREATED".equals(status)) {
            rabbitMQService.publishClaimCreated(
                    claim.getId(),
                    claim.getStudentName(),
                    claim.getStudentEmail(),
                    claim.getSubject(),
                    priority,
                    finalCategory,
                    sentiment,
                    assignedTo,
                    slaDeadline.toString()
            );
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(claim));
    }

    // ── Update status ─────────────────────────────────────────────────────────

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {

        String newStatus = request.getStatus();
        if (!ALL_STATUSES.contains(newStatus)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid status. Must be one of: " + String.join(", ", ALL_STATUSES)
            ));
        }

        Claim claim = claimRepository.findById(id).orElse(null);
        if (claim == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Claim not found"));
        }

        if (!aiAnalysisService.validateTransition(claim.getStatus(), newStatus)) {
            List<String> allowed = AiAnalysisService.VALID_TRANSITIONS
                    .getOrDefault(claim.getStatus(), List.of());
            return ResponseEntity.badRequest().body(Map.of(
                    "error",   "Invalid transition: " + claim.getStatus() + " → " + newStatus,
                    "allowed", allowed,
                    "current", claim.getStatus()
            ));
        }

        String previousStatus = claim.getStatus();
        claim.setStatus(newStatus);

        if (request.getAdminResponse() != null) {
            claim.setAdminResponse(request.getAdminResponse());
        }

        if ("RESOLVED".equals(newStatus)) {
            claim.setResolvedAt(LocalDateTime.now());
        } else if ("CLOSED".equals(newStatus)) {
            claim.setClosedAt(LocalDateTime.now());
        } else if ("IN_PROGRESS".equals(newStatus) && "RESOLVED".equals(previousStatus)) {
            // Reopen: clear resolved_at
            claim.setResolvedAt(null);
        }

        claimRepository.save(claim);

        // Email student
        emailService.sendStatusChangeEmail(claim, newStatus, request.getAdminResponse());

        // Publish to RabbitMQ
        rabbitMQService.publishStatusChanged(
                claim.getId(),
                claim.getStudentEmail(),
                claim.getStudentName(),
                claim.getSubject(),
                newStatus,
                previousStatus,
                request.getAdminResponse()
        );

        return ResponseEntity.ok(Map.of(
                "id",             id,
                "status",         newStatus,
                "previousStatus", previousStatus,
                "adminResponse",  request.getAdminResponse() != null ? request.getAdminResponse() : "",
                "transition",     previousStatus + " → " + newStatus
        ));
    }

    // ── Reassign agent ────────────────────────────────────────────────────────

    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignClaim(
            @PathVariable Long id,
            @Valid @RequestBody AssignRequest request) {

        Claim claim = claimRepository.findById(id).orElse(null);
        if (claim == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Claim not found"));
        }

        claim.setAssignedTo(request.getAssignedTo());
        claimRepository.save(claim);

        rabbitMQService.publishAssigned(id, request.getAssignedTo(), claim.getSubject());

        return ResponseEntity.ok(Map.of("id", id, "assigned_to", request.getAssignedTo()));
    }

    // ── Delete claim ──────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClaim(@PathVariable Long id) {
        if (!claimRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Claim not found"));
        }
        claimRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Claim deleted"));
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats() {
        StatsResponse stats = StatsResponse.builder()
                .total(claimRepository.count())
                .created(claimRepository.countByStatus("CREATED"))
                .inProgress(claimRepository.countByStatus("IN_PROGRESS"))
                .resolved(claimRepository.countByStatus("RESOLVED"))
                .closed(claimRepository.countByStatus("CLOSED"))
                .rejected(claimRepository.countByStatus("REJECTED"))
                .critical(claimRepository.countByPriority("CRITICAL"))
                .escalated(claimRepository.countByEscalatedTrue())
                .slaBreached(claimRepository.countSlaBreached())
                .build();
        return ResponseEntity.ok(stats);
    }

    // ── SSE Endpoints ─────────────────────────────────────────────────────────

    @GetMapping(value = "/notifications/agent/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter agentStream() {
        return sseService.createAgentEmitter();
    }

    @GetMapping(value = "/notifications/user/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<?> userStream(@RequestParam(required = false) String email) {
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email query parameter required"));
        }
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_EVENT_STREAM)
                .body(sseService.createUserEmitter(email));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private ClaimResponse toResponse(Claim c) {
        return ClaimResponse.builder()
                .id(c.getId())
                .studentName(c.getStudentName())
                .studentEmail(c.getStudentEmail())
                .subject(c.getSubject())
                .description(c.getDescription())
                .category(c.getCategory())
                .status(c.getStatus())
                .priority(c.getPriority())
                .sentiment(c.getSentiment())
                .aiSuggestion(c.getAiSuggestion())
                .adminResponse(c.getAdminResponse())
                .assignedTo(c.getAssignedTo())
                .slaDeadline(c.getSlaDeadline())
                .escalated(c.getEscalated())
                .escalationCount(c.getEscalationCount())
                .resolvedAt(c.getResolvedAt())
                .closedAt(c.getClosedAt())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private PageResponse<ClaimResponse> toPageResponse(Page<Claim> page, int pageNum, int limit) {
        List<ClaimResponse> data = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return PageResponse.<ClaimResponse>builder()
                .data(data)
                .total(page.getTotalElements())
                .page(pageNum)
                .limit(limit)
                .totalPages(page.getTotalPages())
                .build();
    }
}
