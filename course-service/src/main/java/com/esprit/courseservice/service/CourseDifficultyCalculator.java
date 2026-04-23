package com.esprit.courseservice.service;

import com.esprit.courseservice.domain.CourseDifficulty;
import com.esprit.courseservice.domain.CourseType;
import com.esprit.courseservice.entity.Course;
import com.esprit.courseservice.entity.CourseChapter;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Component;

@Component
public class CourseDifficultyCalculator {

    DifficultyAssessment assess(Course course) {
        double chapterLoad = round(Math.min(course.getChapters() * 8.0, 40.0));
        double averageSections = course.getChaptersData().isEmpty()
                ? 0
                : course.getChaptersData().stream()
                .mapToInt(chapter -> chapter.getSections() == null ? 0 : chapter.getSections().size())
                .average()
                .orElse(0);
        double sectionDensity = round(Math.min(averageSections * 6.0, 24.0));
        double durationLoad = round(Math.min(parseDurationToWeeks(course.getDuration()) * 4.0, 20.0));
        double contentComplexity = round(contentComplexity(course));
        double deliveryComplexity = course.getType() == CourseType.BLENDED_COURSE ? 6.0 : 4.0;

        double score = round(Math.min(chapterLoad + sectionDensity + durationLoad + contentComplexity + deliveryComplexity, 100.0));
        CourseDifficulty label = classify(score);

        return new DifficultyAssessment(
                score,
                label,
                chapterLoad,
                sectionDensity,
                durationLoad,
                contentComplexity,
                deliveryComplexity
        );
    }

    private CourseDifficulty classify(double score) {
        if (score >= 70) {
            return CourseDifficulty.ADVANCED;
        }
        if (score >= 35) {
            return CourseDifficulty.INTERMEDIATE;
        }
        return CourseDifficulty.BEGINNER;
    }

    private double parseDurationToWeeks(String duration) {
        if (duration == null || duration.isBlank()) {
            return 0;
        }

        String normalized = duration.trim().toLowerCase(Locale.ROOT);
        String[] parts = normalized.split("\\s+");
        if (parts.length == 0) {
            return 0;
        }

        double value;
        try {
            value = Double.parseDouble(parts[0].replace(",", "."));
        } catch (NumberFormatException exception) {
            return 0;
        }

        if (normalized.contains("month")) {
            return value * 4.0;
        }
        if (normalized.contains("day")) {
            return value / 7.0;
        }
        if (normalized.contains("hour")) {
            return value / 40.0;
        }
        return value;
    }

    private double contentComplexity(Course course) {
        int keywordMatches = countAdvancedKeywords(course.getTitle())
                + countAdvancedKeywords(course.getDescription())
                + course.getChaptersData().stream().map(CourseChapter::getName).mapToInt(this::countAdvancedKeywords).sum();

        int wordCount = wordCount(course.getDescription()) + wordCount(course.getTitle());
        double keywordScore = Math.min(keywordMatches * 3.0, 10.0);
        double richnessScore = wordCount >= 30 ? 4.0 : wordCount >= 20 ? 2.0 : 0.0;

        return Math.min(keywordScore + richnessScore, 10.0);
    }

    private int countAdvancedKeywords(String value) {
        if (value == null || value.isBlank()) {
            return 0;
        }

        List<String> keywords = List.of(
                "advanced", "masterclass", "accelerator", "bootcamp", "professional",
                "business", "exam", "ielts", "strategy", "fluency", "presentation"
        );
        String normalized = value.toLowerCase(Locale.ROOT);
        return (int) keywords.stream().filter(normalized::contains).count();
    }

    private int wordCount(String value) {
        if (value == null || value.isBlank()) {
            return 0;
        }
        return value.trim().split("\\s+").length;
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    public record DifficultyAssessment(
            double score,
            CourseDifficulty label,
            double chapterLoad,
            double sectionDensity,
            double durationLoad,
            double contentComplexity,
            double deliveryComplexity
    ) {
    }
}
