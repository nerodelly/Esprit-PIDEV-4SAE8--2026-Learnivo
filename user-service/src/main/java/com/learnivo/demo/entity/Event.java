package com.learnivo.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    private String location;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by_user_id")
    private String createdByUserId;

    @Column(name = "linked_service", nullable = false)
    @Builder.Default
    private String linkedService = "user-service";

    @Column(name = "owner_context")
    @Builder.Default
    private String ownerContext = "mohamed-work";

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (linkedService == null) {
            linkedService = "user-service";
        }
        if (ownerContext == null) {
            ownerContext = "mohamed-work";
        }
    }
}
