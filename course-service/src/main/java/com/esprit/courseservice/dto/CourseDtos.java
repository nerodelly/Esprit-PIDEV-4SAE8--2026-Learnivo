package com.esprit.courseservice.dto;

import com.esprit.courseservice.domain.CourseStatus;
import com.esprit.courseservice.domain.CourseType;
import com.esprit.courseservice.domain.CourseQuizProgressStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public final class CourseDtos {

    private CourseDtos() {
    }

    public record CourseSectionRequest(
            @NotBlank @Size(max = 140) String name,
            boolean completed
    ) {
    }

    public record CourseSectionResponse(
            Long id,
            String name,
            boolean completed
    ) {
    }

    public record CourseChapterRequest(
            @NotBlank @Size(max = 140) String name,
            @NotNull @Min(1) Integer number,
            @NotBlank String pdfUrl,
            @Valid List<CourseSectionRequest> sections
    ) {
    }

    public record CourseChapterResponse(
            Long id,
            String name,
            Integer number,
            String pdfUrl,
            List<CourseSectionResponse> sections
    ) {
    }

    public record CourseRequest(
            @NotBlank @Size(min = 5, max = 120) String title,
            @NotBlank @Size(min = 20, max = 800) String description,
            @NotNull CourseType type,
            @NotNull CourseStatus status,
            @NotBlank @Size(max = 32) String level,
            @NotBlank String image,
            String banner,
            @NotBlank @Size(min = 3, max = 80) String instructor,
            @NotBlank @Size(max = 80) String category,
            @NotNull @Min(1) @Max(5) Integer chapters,
            @NotBlank @Size(max = 40) String duration,
            @Valid @NotEmpty List<CourseChapterRequest> chaptersData
    ) {
    }

    public record CourseResponse(
            Long id,
            String title,
            String description,
            String type,
            String status,
            String level,
            double difficultyScore,
            String difficultyLabel,
            String image,
            String banner,
            String slug,
            String action,
            String instructor,
            String category,
            Integer chapters,
            String duration,
            List<CourseChapterResponse> chaptersData,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record CourseDifficultyResponse(
            Long courseId,
            String courseTitle,
            double difficultyScore,
            String difficultyLabel,
            double chapterLoad,
            double sectionDensity,
            double durationLoad,
            double contentComplexity,
            double deliveryComplexity
    ) {
    }

    public record CategoryShareResponse(
            String category,
            long count,
            double percentage
    ) {
    }

    public record CourseAnalyticsResponse(
            long totalCourses,
            long publishedCourses,
            long draftCourses,
            double averageChapters,
            List<CategoryShareResponse> categories
    ) {
    }

    public record CourseProgressResponse(
            Long courseId,
            String courseTitle,
            int completedChapters,
            int totalChapters,
            double chapterProgressPercent,
            double progressPercent,
            Integer nextUnlockedChapter,
            boolean allChaptersCompleted,
            boolean quizUnlocked,
            CourseQuizProgressStatus quizStatus
    ) {
    }
}
