package com.learnivo.claimsservice.dto;

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
    private String studentName;
    private String studentEmail;
    private String subject;
    private String description;
    private String category;
    private String status;
    private String priority;
    private String sentiment;
    private String aiSuggestion;
    private String adminResponse;
    private String assignedTo;
    private LocalDateTime slaDeadline;
    private Boolean escalated;
    private Integer escalationCount;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
