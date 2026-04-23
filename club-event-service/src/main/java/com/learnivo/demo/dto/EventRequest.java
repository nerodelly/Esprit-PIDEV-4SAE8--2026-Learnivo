package com.learnivo.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record EventRequest(
        @NotBlank(message = "Le titre est requis")
        @Size(min = 2, max = 200, message = "Le titre doit contenir entre 2 et 200 caractères")
        String title,
        @Size(max = 2000, message = "La description ne peut pas dépasser 2000 caractères")
        String description,
        @NotNull(message = "La date de début est requise")
        LocalDateTime startTime,
        @NotNull(message = "La date de fin est requise")
        LocalDateTime endTime,
        @Size(max = 255, message = "Le lieu ne peut pas dépasser 255 caractères")
        String location,
        @NotBlank(message = "Le statut est requis")
        String status,
        @Size(max = 255)
        String clubName,
        Integer maxParticipants,
        LocalDateTime publishAt
) {
}
