package com.esprit.quizservice.dto;

import com.esprit.quizservice.domain.QuizDifficulty;
import com.esprit.quizservice.domain.QuizStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public final class QuizDtos {

    private QuizDtos() {
    }

    public record QuizQuestionRequest(
            @NotBlank @Size(max = 80) String id,
            @NotBlank @Size(max = 220) String text,
            @NotNull @Size(min = 4, max = 4) List<@NotBlank @Size(max = 160) String> options,
            @NotNull @Min(0) @Max(3) Integer correctAnswer,
            @NotBlank @Size(max = 260) String explanation,
            QuizDifficulty difficulty,
            @Min(1) @Max(5) Integer weight
    ) {
        public QuizQuestionRequest(String id, String text, List<String> options, Integer correctAnswer, String explanation) {
            this(id, text, options, correctAnswer, explanation, null, null);
        }
    }

    public record QuizQuestionResponse(
            Long internalId,
            String id,
            String text,
            List<String> options,
            Integer correctAnswer,
            String explanation,
            String difficulty,
            Integer weight
    ) {
    }

    public record QuizRequest(
            @NotBlank @Size(min = 5, max = 120) String title,
            @NotBlank @Size(min = 5, max = 120) String course,
            @NotBlank @Size(max = 80) String category,
            @NotNull QuizDifficulty difficulty,
            @NotNull @Min(3) @Max(10) Integer questions,
            @NotBlank @Size(max = 20) String duration,
            @NotNull @Min(70) @Max(100) Integer passScore,
            @NotNull QuizStatus status,
            Instant publishAt,
            @Valid @NotEmpty @Size(min = 3, max = 10) List<QuizQuestionRequest> items
    ) {
    }

    public record QuizResponse(
            Long id,
            String title,
            String course,
            String category,
            String difficulty,
            Integer questions,
            String duration,
            Integer passScore,
            String status,
            Instant publishAt,
            List<QuizQuestionResponse> items,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record DifficultyShareResponse(
            String difficulty,
            long count,
            double percentage
    ) {
    }

    public record QuizAnalyticsResponse(
            long totalQuizzes,
            long publishedQuizzes,
            long draftQuizzes,
            long archivedQuizzes,
            double averageQuestions,
            List<DifficultyShareResponse> difficulties
    ) {
    }

    public record QuizAttemptRequest(
            @NotNull Map<String, Integer> answers,
            @NotBlank @Email @Size(max = 160) String learnerEmail
    ) {
    }

    public record QuizQuestionReview(
            String questionId,
            String question,
            Integer selectedAnswer,
            Integer correctAnswer,
            boolean correct,
            String explanation,
            String difficulty,
            int weight,
            int earnedWeight
    ) {
    }

    public record QuizEmailNotification(
            String recipient,
            String subject,
            String preview,
            String callToAction,
            List<String> highlights,
            boolean delivered,
            String deliveryMode,
            String statusMessage
    ) {
    }

    public record QuizAttemptResponse(
            long correctAnswers,
            int totalQuestions,
            double baseScore,
            int earnedWeight,
            int totalWeight,
            double bonusPoints,
            double penaltyPoints,
            double score,
            boolean passed,
            List<QuizQuestionReview> review,
            QuizEmailNotification emailNotification
    ) {
    }
}
