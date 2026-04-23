package com.esprit.courseservice.service;

import com.esprit.courseservice.domain.CourseStatus;
import com.esprit.courseservice.domain.CourseType;
import com.esprit.courseservice.domain.CourseQuizProgressStatus;
import com.esprit.courseservice.dto.CourseDtos.CourseAnalyticsResponse;
import com.esprit.courseservice.dto.CourseDtos.CourseDifficultyResponse;
import com.esprit.courseservice.dto.CourseDtos.CourseProgressResponse;
import com.esprit.courseservice.dto.CourseDtos.CourseRequest;
import com.esprit.courseservice.dto.CourseDtos.CourseResponse;
import com.esprit.courseservice.entity.CourseChapter;
import com.esprit.courseservice.entity.Course;
import com.esprit.courseservice.exception.BadRequestException;
import com.esprit.courseservice.exception.NotFoundException;
import com.esprit.courseservice.repository.CourseRepository;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;
    private final QuizServiceClient quizServiceClient;
    private final CourseDifficultyCalculator courseDifficultyCalculator;

    public CourseService(
            CourseRepository courseRepository,
            CourseMapper courseMapper,
            QuizServiceClient quizServiceClient,
            CourseDifficultyCalculator courseDifficultyCalculator
    ) {
        this.courseRepository = courseRepository;
        this.courseMapper = courseMapper;
        this.quizServiceClient = quizServiceClient;
        this.courseDifficultyCalculator = courseDifficultyCalculator;
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> findAll(String search, CourseStatus status, String level, String category, CourseType type) {
        String query = normalize(search);
        String normalizedLevel = normalize(level);
        String normalizedCategory = normalize(category);

        return courseRepository.findAll().stream()
                .filter(course -> query.isBlank() || contains(course.getTitle(), query)
                        || contains(course.getCategory(), query)
                        || contains(course.getInstructor(), query))
                .filter(course -> status == null || course.getStatus() == status)
                .filter(course -> normalizedLevel.isBlank() || course.getLevel().equalsIgnoreCase(normalizedLevel))
                .filter(course -> normalizedCategory.isBlank() || course.getCategory().equalsIgnoreCase(normalizedCategory))
                .filter(course -> type == null || course.getType() == type)
                .sorted(Comparator.comparing(Course::getUpdatedAt).reversed())
                .peek(this::applyDifficultyMetadata)
                .map(courseMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseResponse findById(Long id) {
        Course course = load(id);
        applyDifficultyMetadata(course);
        return courseMapper.toResponse(course);
    }

    @Transactional(readOnly = true)
    public CourseResponse findBySlug(String slug) {
        return courseRepository.findBySlug(slug)
                .map(course -> {
                    applyDifficultyMetadata(course);
                    return course;
                })
                .map(courseMapper::toResponse)
                .orElseThrow(() -> new NotFoundException("Course not found for slug: " + slug));
    }

    @Transactional(readOnly = true)
    public CourseDifficultyResponse difficulty(Long id) {
        Course course = load(id);
        CourseDifficultyCalculator.DifficultyAssessment assessment = applyDifficultyMetadata(course);
        return courseMapper.toDifficultyResponse(course, assessment);
    }

    @Transactional(readOnly = true)
    public CourseProgressResponse progress(Long id, CourseQuizProgressStatus quizStatus) {
        Course course = load(id);
        int totalChapters = course.getChaptersData().size();
        int completedChapters = (int) course.getChaptersData().stream()
                .filter(this::isChapterCompleted)
                .count();
        boolean allChaptersCompleted = totalChapters > 0 && completedChapters == totalChapters;
        boolean quizUnlocked = allChaptersCompleted;

        double chapterProgressPercent = totalChapters == 0 ? 0 : (completedChapters * 50.0) / totalChapters;
        double progressPercent = chapterProgressPercent;
        if (quizStatus == CourseQuizProgressStatus.PASSED && allChaptersCompleted) {
            progressPercent = 100;
        } else if (quizStatus == CourseQuizProgressStatus.FAILED && allChaptersCompleted) {
            progressPercent = 80;
        }

        Integer nextUnlockedChapter = course.getChaptersData().stream()
                .filter(chapter -> !isChapterCompleted(chapter))
                .map(CourseChapter::getNumber)
                .findFirst()
                .orElse(null);

        return courseMapper.toProgress(
                course,
                completedChapters,
                totalChapters,
                chapterProgressPercent,
                progressPercent,
                nextUnlockedChapter,
                allChaptersCompleted,
                quizUnlocked,
                quizStatus
        );
    }

    public CourseResponse create(CourseRequest request) {
        validate(request);
        Course course = new Course();
        courseMapper.updateEntity(course, request, uniqueSlug(request.title(), null));
        applyDifficultyMetadata(course);
        return courseMapper.toResponse(courseRepository.save(course));
    }

    public CourseResponse update(Long id, CourseRequest request) {
        validate(request);
        Course course = load(id);
        String previousTitle = course.getTitle();
        courseMapper.updateEntity(course, request, uniqueSlug(request.title(), id));
        applyDifficultyMetadata(course);
        Course saved = courseRepository.save(course);
        if (!previousTitle.equals(saved.getTitle())) {
            quizServiceClient.renameCourse(previousTitle, saved.getTitle());
        }
        return courseMapper.toResponse(saved);
    }

    public CourseResponse updateStatus(Long id, CourseStatus status) {
        Course course = load(id);
        course.setStatus(status);
        return courseMapper.toResponse(courseRepository.save(course));
    }

    public CourseResponse toggleStatus(Long id) {
        Course course = load(id);
        course.setStatus(course.getStatus() == CourseStatus.PUBLISHED ? CourseStatus.DRAFT : CourseStatus.PUBLISHED);
        return courseMapper.toResponse(courseRepository.save(course));
    }

    public void delete(Long id) {
        Course course = load(id);
        String courseTitle = course.getTitle();
        courseRepository.delete(course);
        quizServiceClient.deleteByCourseTitle(courseTitle);
    }

    @Transactional(readOnly = true)
    public CourseAnalyticsResponse analytics() {
        List<Course> courses = courseRepository.findAll();
        long total = courses.size();
        long published = courses.stream().filter(course -> course.getStatus() == CourseStatus.PUBLISHED).count();
        long draft = courses.stream().filter(course -> course.getStatus() == CourseStatus.DRAFT).count();
        double averageChapters = courses.stream().mapToInt(Course::getChapters).average().orElse(0);
        Map<String, Long> categories = new LinkedHashMap<>();
        for (Course course : courses) {
            categories.merge(course.getCategory(), 1L, Long::sum);
        }
        return courseMapper.toAnalytics(total, published, draft, averageChapters, categories);
    }

    private Course load(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Course not found with id: " + id));
    }

    private void validate(CourseRequest request) {
        if (request.chapters() > 5) {
            throw new BadRequestException("A course can contain at most 5 chapters.");
        }
        if (request.chaptersData().size() != request.chapters()) {
            throw new BadRequestException("The number of chapter payloads must match the chapters field.");
        }
        boolean missingPdf = request.chaptersData().stream().anyMatch(chapter -> chapter.pdfUrl() == null || chapter.pdfUrl().isBlank());
        if (missingPdf) {
            throw new BadRequestException("Each chapter must include a PDF URL or base64 payload.");
        }
        boolean invalidNumbers = request.chaptersData().stream().map(chapter -> chapter.number()).distinct().count() != request.chaptersData().size();
        if (invalidNumbers) {
            throw new BadRequestException("Chapter numbers must be unique.");
        }
    }

    private String uniqueSlug(String title, Long currentId) {
        String base = slugify(title);
        String slug = base;
        int counter = 2;

        while (courseRepository.findBySlug(slug).filter(course -> !course.getId().equals(currentId)).isPresent()) {
            slug = base + "-" + counter++;
        }

        return slug;
    }

    private String slugify(String value) {
        String normalized = normalize(value).replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
        if (normalized.isBlank()) {
            throw new BadRequestException("Unable to generate a slug from the course title.");
        }
        return normalized;
    }

    private boolean contains(String value, String query) {
        return normalize(value).contains(query);
    }

    private boolean isChapterCompleted(CourseChapter chapter) {
        return chapter.getSections() != null
                && !chapter.getSections().isEmpty()
                && chapter.getSections().stream().allMatch(section -> section.isCompleted());
    }

    private CourseDifficultyCalculator.DifficultyAssessment applyDifficultyMetadata(Course course) {
        CourseDifficultyCalculator.DifficultyAssessment assessment = courseDifficultyCalculator.assess(course);
        course.setDifficultyScore(assessment.score());
        course.setDifficultyLabel(assessment.label());
        return assessment;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
