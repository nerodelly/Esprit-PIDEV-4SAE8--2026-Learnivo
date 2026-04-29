package com.learnivo.claimsservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssignRequest {

    @NotBlank(message = "assignedTo is required")
    private String assignedTo;
}
