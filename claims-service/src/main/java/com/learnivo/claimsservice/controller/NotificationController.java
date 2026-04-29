package com.learnivo.claimsservice.controller;

import com.learnivo.claimsservice.dto.NotificationReadAllRequest;
import com.learnivo.claimsservice.entity.ClaimNotification;
import com.learnivo.claimsservice.repository.ClaimNotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/claims/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final ClaimNotificationRepository notificationRepository;

    // ── GET agent notifications ───────────────────────────────────────────────

    @GetMapping("/agent")
    public ResponseEntity<List<ClaimNotification>> getAgentNotifications() {
        List<ClaimNotification> notifications = notificationRepository
                .findByTargetRoleOrderByCreatedAtDesc("AGENT", PageRequest.of(0, 50));
        return ResponseEntity.ok(notifications);
    }

    // ── GET user notifications ────────────────────────────────────────────────

    @GetMapping("/user")
    public ResponseEntity<?> getUserNotifications(
            @RequestParam(required = false) String email) {

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email query parameter required"));
        }

        List<ClaimNotification> notifications = notificationRepository
                .findByTargetRoleAndTargetEmailOrderByCreatedAtDesc("USER", email, PageRequest.of(0, 50));
        return ResponseEntity.ok(notifications);
    }

    // ── Mark single notification as read ─────────────────────────────────────

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        if (!notificationRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Notification not found"));
        }
        notificationRepository.markAsRead(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ── Mark all notifications as read ────────────────────────────────────────

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Boolean>> markAllRead(
            @RequestBody NotificationReadAllRequest request) {

        if ("AGENT".equals(request.getRole())) {
            notificationRepository.markAllReadByRole("AGENT");
        } else if ("USER".equals(request.getRole()) &&
                   request.getEmail() != null && !request.getEmail().isBlank()) {
            notificationRepository.markAllReadByRoleAndEmail("USER", request.getEmail());
        }

        return ResponseEntity.ok(Map.of("success", true));
    }
}
