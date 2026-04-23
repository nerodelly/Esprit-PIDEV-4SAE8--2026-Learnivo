package com.esprit.courseservice.service;

import com.esprit.courseservice.dto.CourseDtos.CategoryShareResponse;
import com.esprit.courseservice.dto.CourseDtos.CourseAnalyticsResponse;
import com.esprit.courseservice.dto.CourseDtos.CourseChapterResponse;
import com.esprit.courseservice.dto.CourseDtos.CourseDifficultyResponse;
import com.esprit.courseservice.dto.CourseDtos.CourseProgressResponse;
import com.esprit.courseservice.dto.CourseDtos.CourseRequest;
import com.esprit.courseservice.dto.CourseDtos.CourseResponse;
import com.esprit.courseservice.dto.CourseDtos.CourseSectionResponse;
import com.esprit.courseservice.domain.CourseQuizProgressStatus;
import com.esprit.courseservice.entity.ChapterSection;
import com.esprit.courseservice.entity.Course;
import com.esprit.courseservice.entity.CourseChapter;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {

    CourseResponse toResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                formatType(course.getType().name()),
                formatLabel(course.getStatus().name()),
                course.getLevel(),
                round(course.getDifficultyScore() == null ? 0 : course.getDifficultyScore()),
                formatDifficulty(course.getDifficultyLabel()),
                course.getImage(),
                course.getBanner(),
                course.getSlug(),
                course.getActionLabel(),
                course.getInstructor(),
                course.getCategory(),
                course.getChapters(),
                course.getDuration(),
                course.getChaptersData().stream().map(this::toChapterResponse).toList(),
                course.getCreatedAt(),
                course.getUpdatedAt()
        );
    }

    CourseDifficultyResponse toDifficultyResponse(Course course, CourseDifficultyCalculator.DifficultyAssessment assessment) {
        return new CourseDifficultyResponse(
                course.getId(),
                course.getTitle(),
                round(assessment.score()),
                formatDifficulty(assessment.label()),
                round(assessment.chapterLoad()),
                round(assessment.sectionDensity()),
                round(assessment.durationLoad()),
                round(assessment.contentComplexity()),
                round(assessment.deliveryComplexity())
        );
    }

    CourseAnalyticsResponse toAnalytics(long total, long published, long draft, double averageChapters, Map<String, Long> categoryCounts) {
        List<CategoryShareResponse> categories = categoryCounts.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new CategoryShareResponse(
                        entry.getKey(),
                        entry.getValue(),
                        total == 0 ? 0 : round((entry.getValue() * 100.0) / total)
                ))
                .toList();

        return new CourseAnalyticsResponse(total, published, draft, round(averageChapters), categories);
    }

    CourseProgressResponse toProgress(
            Course course,
            int completedChapters,
            int totalChapters,
            double chapterProgressPercent,
            double progressPercent,
            Integer nextUnlockedChapter,
            boolean allChaptersCompleted,
            boolean quizUnlocked,
            CourseQuizProgressStatus quizStatus
    ) {
        return new CourseProgressResponse(
                course.getId(),
                course.getTitle(),
                completedChapters,
                totalChapters,
                round(chapterProgressPercent),
                round(progressPercent),
                nextUnlockedChapter,
                allChaptersCompleted,
                quizUnlocked,
                quizStatus
        );
    }

    void updateEntity(Course course, CourseRequest request, String slug) {
        course.setTitle(request.title().trim());
        course.setDescription(request.description().trim());
        course.setType(request.type());
        course.setStatus(request.status());
        course.setLevel(request.level().trim());
        course.setImage(request.image().trim());
        course.setBanner((request.banner() == null || request.banner().isBlank()) ? request.image().trim() : request.banner().trim());
        course.setSlug(slug);
        course.setActionLabel("Enroll now");
        course.setInstructor(request.instructor().trim());
        course.setCategory(request.category().trim());
        course.setChapters(request.chapters());
        course.setDuration(request.duration().trim());
        course.getChaptersData().clear();

        for (var chapterRequest : request.chaptersData()) {
            CourseChapter chapter = new CourseChapter();
            chapter.setCourse(course);
            chapter.setName(chapterRequest.name().trim());
            chapter.setNumber(chapterRequest.number());
            chapter.setPdfUrl(chapterRequest.pdfUrl().trim());

            var sections = chapterRequest.sections() == null ? List.<ChapterSection>of() : chapterRequest.sections().stream()
                    .map(sectionRequest -> {
                        ChapterSection section = new ChapterSection();
                        section.setChapter(chapter);
                        section.setName(sectionRequest.name().trim());
                        section.setCompleted(sectionRequest.completed());
                        return section;
                    })
                    .toList();

            chapter.setSections(sections);
            course.getChaptersData().add(chapter);
        }
    }

    private CourseChapterResponse toChapterResponse(CourseChapter chapter) {
        return new CourseChapterResponse(
                chapter.getId(),
                chapter.getName(),
                chapter.getNumber(),
                chapter.getPdfUrl(),
                chapter.getSections().stream().map(this::toSectionResponse).toList()
        );
    }

    private CourseSectionResponse toSectionResponse(ChapterSection section) {
        return new CourseSectionResponse(section.getId(), section.getName(), section.isCompleted());
    }

    private String formatType(String type) {
        return switch (type) {
            case "BLENDED_COURSE" -> "Blended course";
            case "LIVE_CLASSES" -> "Live classes";
            default -> type;
        };
    }

    private String formatLabel(String value) {
        return value.substring(0, 1) + value.substring(1).toLowerCase();
    }

    private String formatDifficulty(Enum<?> value) {
        return value == null ? "Unknown" : formatLabel(value.name());
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
