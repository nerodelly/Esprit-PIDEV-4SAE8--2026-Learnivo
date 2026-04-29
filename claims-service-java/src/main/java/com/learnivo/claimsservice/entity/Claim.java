package com.learnivo.claimsservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "student_email", nullable = false)
    private String studentEmail;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    @Builder.Default
    private String category = "General";

    @Column(length = 20)
    @Builder.Default
    private String status = "CREATED";

    @Column(length = 20)
    @Builder.Default
    private String priority = "LOW";

    @Column(length = 50)
    @Builder.Default
    private String sentiment = "NEUTRAL";

    @Column(name = "ai_suggestion", columnDefinition = "TEXT")
    private String aiSuggestion;

    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;

    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "sla_deadline")
    private LocalDateTime slaDeadline;

    @Column
    @Builder.Default
    private Boolean escalated = false;

    @Column(name = "escalation_count")
    @Builder.Default
    private Integer escalationCount = 0;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
