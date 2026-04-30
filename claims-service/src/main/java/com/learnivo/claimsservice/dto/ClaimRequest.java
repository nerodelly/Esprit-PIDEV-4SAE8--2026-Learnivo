package com.learnivo.claimsservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClaimRequest {

    @NotBlank(message = "Student name is required")
    @JsonProperty("student_name")
    private String studentName;

    @NotBlank(message = "Student email is required")
    @Email(message = "Student email must be valid")
    @JsonProperty("student_email")
    private String studentEmail;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Description is required")
    private String description;

    private String category;
}
