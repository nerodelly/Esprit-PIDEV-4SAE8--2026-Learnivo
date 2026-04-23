package com.learnivo.demo.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record EventRegistrationRequest(
        @NotNull(message = "Registered at is required")
        LocalDateTime registeredAt,
        @NotNull(message = "Status is required")
        String status,
        @NotNull(message = "Event is required")
        Long eventId,
        @NotNull(message = "Student is required")
        Long studentId
) {}
