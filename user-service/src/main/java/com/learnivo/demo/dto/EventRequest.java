package com.learnivo.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record EventRequest(
        @NotBlank(message = "Title is required")
        String title,
        String description,
        @NotNull(message = "Start time is required")
        LocalDateTime startTime,
        @NotNull(message = "End time is required")
        LocalDateTime endTime,
        String location,
        @NotBlank(message = "Status is required")
        String status,
        String createdByUserId,
        String linkedService,
        String ownerContext
) {
}
