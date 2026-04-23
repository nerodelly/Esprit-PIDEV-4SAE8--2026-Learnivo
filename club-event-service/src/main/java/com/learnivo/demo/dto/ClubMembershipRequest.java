package com.learnivo.demo.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record ClubMembershipRequest(
        @NotNull(message = "Joined at is required")
        LocalDateTime joinedAt,
        @NotNull(message = "Status is required")
        String status,
        @NotNull(message = "Club is required")
        Long clubId,
        @NotNull(message = "Student is required")
        Long studentId
) {}
