package com.learnivo.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClubRequest(
        @NotBlank(message = "Le nom est requis")
        @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères")
        String name,
        @Size(max = 2000, message = "La description ne peut pas dépasser 2000 caractères")
        String description,
        @NotBlank(message = "Le statut est requis")
        String status,
        Long professorId
) {}
