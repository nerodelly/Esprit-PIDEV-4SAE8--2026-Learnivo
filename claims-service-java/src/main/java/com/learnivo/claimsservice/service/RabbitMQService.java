package com.learnivo.claimsservice.service;

import com.learnivo.claimsservice.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Publishes events to RabbitMQ using the claims.exchange topic exchange.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RabbitMQService {

    private final RabbitTemplate rabbitTemplate;

    /**
     * Publish a claim.created event (routed to claims.notifications.agent queue).
     */
    public void publishClaimCreated(long claimId, String studentName, String studentEmail,
                                    String subject, String priority, String category,
                                    String sentiment, String assignedTo, String slaDeadline) {
        Map<String, Object> payload = Map.of(
                "claimId",     claimId,
                "studentName", studentName,
                "studentEmail", studentEmail,
                "subject",     subject,
                "priority",    priority,
                "category",    category,
                "sentiment",   sentiment,
                "assignedTo",  assignedTo,
                "slaDeadline", slaDeadline
        );
        publish(RabbitMQConfig.ROUTING_CLAIM_CREATED, payload);
        log.info("📤 Published claim.created event for claim #{}", claimId);
    }

    /**
     * Publish a claim.status.changed event (routed to claims.notifications.user queue).
     */
    public void publishStatusChanged(long claimId, String studentEmail, String studentName,
                                     String subject, String newStatus, String previousStatus,
                                     String adminResponse) {
        Map<String, Object> payload = Map.of(
                "claimId",        claimId,
                "studentEmail",   studentEmail,
                "studentName",    studentName,
                "subject",        subject,
                "newStatus",      newStatus,
                "previousStatus", previousStatus,
                "adminResponse",  adminResponse != null ? adminResponse : ""
        );
        publish(RabbitMQConfig.ROUTING_STATUS_CHANGED, payload);
        log.info("📤 Published claim.status.changed for claim #{}: {} → {}", claimId, previousStatus, newStatus);
    }

    /**
     * Publish a claim.assigned event.
     */
    public void publishAssigned(long claimId, String assignedTo, String subject) {
        Map<String, Object> payload = Map.of(
                "claimId",    claimId,
                "assignedTo", assignedTo,
                "subject",    subject
        );
        publish(RabbitMQConfig.ROUTING_CLAIM_ASSIGNED, payload);
        log.info("📤 Published claim.assigned for claim #{}", claimId);
    }

    /**
     * Publish a claim.escalated event.
     */
    public void publishEscalated(long claimId, String studentEmail, String subject,
                                  String oldPriority, String newPriority, String reason) {
        Map<String, Object> payload = Map.of(
                "claimId",      claimId,
                "studentEmail", studentEmail,
                "subject",      subject,
                "oldPriority",  oldPriority,
                "newPriority",  newPriority,
                "reason",       reason
        );
        publish(RabbitMQConfig.ROUTING_CLAIM_ESCALATED, payload);
        log.info("📤 Published claim.escalated for claim #{}: {} → {}", claimId, oldPriority, newPriority);
    }

    // ── Private helper ────────────────────────────────────────────────────────

    private void publish(String routingKey, Object payload) {
        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, routingKey, payload);
        } catch (Exception e) {
            log.error("RabbitMQ publish error (key={}): {}", routingKey, e.getMessage());
        }
    }
}
