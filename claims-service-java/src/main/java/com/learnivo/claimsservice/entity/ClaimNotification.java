package com.learnivo.claimsservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "claim_notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String type;

    /**
     * Target role: AGENT or USER (stored as VARCHAR for flexibility)
     */
    @Column(name = "target_role", nullable = false, length = 10)
    private String targetRole;

    @Column(name = "target_email")
    private String targetEmail;

    @Column(name = "claim_id", nullable = false)
    private Long claimId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
