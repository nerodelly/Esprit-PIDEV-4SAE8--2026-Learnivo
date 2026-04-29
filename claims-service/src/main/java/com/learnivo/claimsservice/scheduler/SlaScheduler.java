package com.learnivo.claimsservice.scheduler;

import com.learnivo.claimsservice.entity.Claim;
import com.learnivo.claimsservice.entity.ClaimNotification;
import com.learnivo.claimsservice.repository.ClaimNotificationRepository;
import com.learnivo.claimsservice.repository.ClaimRepository;
import com.learnivo.claimsservice.service.AiAnalysisService;
import com.learnivo.claimsservice.service.RabbitMQService;
import com.learnivo.claimsservice.service.SseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

/**
 * SLA Escalation Scheduler — runs every 60 seconds.
 * Mirrors the Node.js runSLAChecker() function exactly.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SlaScheduler {

    private final ClaimRepository claimRepository;
    private final ClaimNotificationRepository notificationRepository;
    private final AiAnalysisService aiAnalysisService;
    private final SseService sseService;
    private final RabbitMQService rabbitMQService;

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void runSLAChecker() {
        List<Claim> activeClaims = claimRepository.findActiveClaimsForSLA();
        LocalDateTime now = LocalDateTime.now();

        for (Claim claim : activeClaims) {
            AiAnalysisService.SlaConfig slaConfig =
                    AiAnalysisService.SLA_CONFIG.getOrDefault(claim.getPriority(),
                            AiAnalysisService.SLA_CONFIG.get("LOW"));

            LocalDateTime createdAt = claim.getCreatedAt();
            double hoursElapsed = ChronoUnit.MINUTES.between(createdAt, now) / 60.0;

            // ── Auto-escalation threshold ──────────────────────────────────────
            if (hoursElapsed >= slaConfig.escalateHours() && !Boolean.TRUE.equals(claim.getEscalated())) {
                String oldPriority = claim.getPriority();
                String newPriority = AiAnalysisService.PRIORITY_ESCALATION
                        .getOrDefault(oldPriority, oldPriority);
                LocalDateTime newSlaDeadline = aiAnalysisService.calculateSLADeadline(newPriority, createdAt);

                claim.setPriority(newPriority);
                claim.setEscalated(true);
                claim.setEscalationCount(claim.getEscalationCount() + 1);
                claim.setSlaDeadline(newSlaDeadline);
                claimRepository.save(claim);

                log.info("⚡ Auto-escalated claim #{}: {} → {}", claim.getId(), oldPriority, newPriority);

                // Persist escalation notification for agents
                String notifTitle   = String.format("⚡ Claim Escalated: %s → %s", oldPriority, newPriority);
                String notifMessage = String.format(
                        "Claim #%d \"%s\" exceeded SLA threshold (%dh). Priority auto-escalated.",
                        claim.getId(), claim.getSubject(), slaConfig.escalateHours()
                );

                ClaimNotification agentNotif = ClaimNotification.builder()
                        .type("CLAIM_ESCALATED")
                        .targetRole("AGENT")
                        .claimId(claim.getId())
                        .title(notifTitle)
                        .message(notifMessage)
                        .build();
                notificationRepository.save(agentNotif);

                // Push SSE to agents
                Map<String, Object> agentSsePayload = Map.of(
                        "type",      "CLAIM_ESCALATED",
                        "claimId",   claim.getId(),
                        "title",     notifTitle,
                        "message",   notifMessage,
                        "priority",  newPriority,
                        "timestamp", now.toString()
                );
                sseService.sendToAgents(agentSsePayload);

                // Push SSE to the student
                Map<String, Object> userSsePayload = Map.of(
                        "type",      "CLAIM_ESCALATED",
                        "claimId",   claim.getId(),
                        "title",     "⚡ Claim Priority Upgraded",
                        "message",   String.format(
                                "Your claim \"%s\" has been automatically escalated due to processing time.",
                                claim.getSubject()),
                        "timestamp", now.toString()
                );
                sseService.sendToUser(claim.getStudentEmail(), userSsePayload);

                // Publish to RabbitMQ
                rabbitMQService.publishEscalated(
                        claim.getId(),
                        claim.getStudentEmail(),
                        claim.getSubject(),
                        oldPriority,
                        newPriority,
                        "SLA threshold exceeded"
                );

            // ── SLA warning threshold ──────────────────────────────────────────
            } else if (hoursElapsed >= slaConfig.warnHours() && !Boolean.TRUE.equals(claim.getEscalated())) {
                double remaining = Math.max(0, slaConfig.maxHours() - hoursElapsed);

                // Only warn once every 6 hours (check updatedAt)
                LocalDateTime lastUpdate = claim.getUpdatedAt();
                if (lastUpdate == null ||
                        ChronoUnit.HOURS.between(lastUpdate, now) >= 6) {

                    Map<String, Object> warnPayload = Map.of(
                            "type",      "SLA_WARNING",
                            "claimId",   claim.getId(),
                            "title",     String.format("⏰ SLA Warning: Claim #%d", claim.getId()),
                            "message",   String.format(
                                    "Only %.1fh remaining for \"%s\" (%s priority). Please take action.",
                                    remaining, claim.getSubject(), claim.getPriority()),
                            "timestamp", now.toString()
                    );
                    sseService.sendToAgents(warnPayload);

                    // Touch updatedAt to avoid spamming
                    claim.setUpdatedAt(now);
                    claimRepository.save(claim);
                }
            }
        }
    }
}
