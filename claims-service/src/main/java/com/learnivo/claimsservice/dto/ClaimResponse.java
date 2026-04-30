package com.learnivo.claimsservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimResponse {

    private Long id;

    @JsonProperty("student_name")
    private String studentName;

    @JsonProperty("student_email")
    private String studentEmail;

    private String subject;
    private String description;
    private String category;
    private String status;
    private String priority;
    private String sentiment;

    @JsonProperty("ai_suggestion")
    private String aiSuggestion;

    @JsonProperty("admin_response")
    private String adminResponse;

    @JsonProperty("assigned_to")
    private String assignedTo;

    @JsonProperty("sla_deadline")
    private LocalDateTime slaDeadline;

    private Boolean escalated;

    @JsonProperty("escalation_count")
    private Integer escalationCount;

    @JsonProperty("resolved_at")
    private LocalDateTime resolvedAt;

    @JsonProperty("closed_at")
    private LocalDateTime closedAt;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
