package com.learnivo.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProfessorRequest(
        @NotBlank(message = "Le nom est requis")
        @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères")
        String name,
        @Email(message = "Adresse email invalide")
        @Size(max = 255)
        String email
) {}
