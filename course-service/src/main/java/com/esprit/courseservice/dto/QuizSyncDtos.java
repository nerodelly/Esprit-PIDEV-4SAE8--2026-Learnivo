package com.esprit.courseservice.dto;

import jakarta.validation.constraints.NotBlank;

public final class QuizSyncDtos {

    private QuizSyncDtos() {
    }

    public record CourseRenameRequest(
            @NotBlank String previousTitle,
            @NotBlank String nextTitle
    ) {
    }
}
