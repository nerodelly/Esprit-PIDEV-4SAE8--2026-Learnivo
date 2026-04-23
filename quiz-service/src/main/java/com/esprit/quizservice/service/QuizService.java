package com.esprit.quizservice.service;

import com.esprit.quizservice.domain.QuizDifficulty;
import com.esprit.quizservice.domain.QuizStatus;
import com.esprit.quizservice.dto.QuizDtos.QuizAnalyticsResponse;
import com.esprit.quizservice.dto.QuizDtos.QuizAttemptRequest;
import com.esprit.quizservice.dto.QuizDtos.QuizAttemptResponse;
import com.esprit.quizservice.dto.QuizDtos.QuizEmailNotification;
import com.esprit.quizservice.dto.QuizDtos.QuizQuestionReview;
import com.esprit.quizservice.dto.QuizDtos.QuizRequest;
import com.esprit.quizservice.dto.QuizDtos.QuizResponse;
import com.esprit.quizservice.entity.Quiz;
import com.esprit.quizservice.exception.BadRequestException;
import com.esprit.quizservice.exception.NotFoundException;
import com.esprit.quizservice.repository.QuizRepository;
import java.util.Comparator;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizMapper quizMapper;
    private final QuizResultEmailService quizResultEmailService;

    public QuizService(QuizRepository quizRepository, QuizMapper quizMapper, QuizResultEmailService quizResultEmailService) {
        this.quizRepository = quizRepository;
        this.quizMapper = quizMapper;
        this.quizResultEmailService = quizResultEmailService;
    }

    @Transactional(readOnly = true)
    public List<QuizResponse> findAll(String search, QuizStatus status, String difficulty, String category, String course) {
        String query = normalize(search);
        String normalizedDifficulty = normalize(difficulty);
        String normalizedCategory = normalize(category);
        String normalizedCourse = normalize(course);

        return quizRepository.findAll().stream()
                .filter(quiz -> query.isBlank()
                        || contains(quiz.getTitle(), query)
                        || contains(quiz.getCourse(), query)
                        || contains(quiz.getCategory(), query))
                .filter(quiz -> status == null || quiz.getStatus() == status)
                .filter(quiz -> normalizedDifficulty.isBlank() || quiz.getDifficulty().name().equalsIgnoreCase(normalizedDifficulty.replace(' ', '_')))
                .filter(quiz -> normalizedCategory.isBlank() || quiz.getCategory().equalsIgnoreCase(normalizedCategory))
                .filter(quiz -> normalizedCourse.isBlank() || quiz.getCourse().equalsIgnoreCase(normalizedCourse))
                .sorted(Comparator.comparing(Quiz::getUpdatedAt).reversed())
                .map(quizMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public QuizResponse findById(Long id) {
        return quizMapper.toResponse(load(id));
    }

    @Transactional(readOnly = true)
    public QuizResponse findPublishedByCourse(String courseTitle) {
        return quizRepository.findAll().stream()
                .filter(quiz -> quiz.getCourse().equalsIgnoreCase(courseTitle))
                .filter(quiz -> quiz.getStatus() == QuizStatus.PUBLISHED)
                .filter(this::isAvailableForLearners)
                .sorted(Comparator.comparing(Quiz::getUpdatedAt).reversed())
                .findFirst()
                .map(quizMapper::toResponse)
                .orElseThrow(() -> new NotFoundException("Published quiz not found for course: " + courseTitle));
    }

    public QuizResponse create(QuizRequest request) {
        validate(request);
        Quiz quiz = new Quiz();
        quizMapper.updateEntity(quiz, request);
        Quiz saved = quizRepository.save(quiz);
        enforceSinglePublishedQuizPerCourse(saved);
        return quizMapper.toResponse(saved);
    }

    public QuizResponse update(Long id, QuizRequest request) {
        validate(request);
        Quiz quiz = load(id);
        quizMapper.updateEntity(quiz, request);
        Quiz saved = quizRepository.save(quiz);
        enforceSinglePublishedQuizPerCourse(saved);
        return quizMapper.toResponse(saved);
    }

    public QuizResponse updateStatus(Long id, QuizStatus status) {
        Quiz quiz = load(id);
        quiz.setStatus(status);
        Quiz saved = quizRepository.save(quiz);
        enforceSinglePublishedQuizPerCourse(saved);
        return quizMapper.toResponse(saved);
    }

    public QuizResponse toggleStatus(Long id) {
        Quiz quiz = load(id);
        QuizStatus next = switch (quiz.getStatus()) {
            case DRAFT -> QuizStatus.PUBLISHED;
            case PUBLISHED -> QuizStatus.ARCHIVED;
            case ARCHIVED -> QuizStatus.DRAFT;
        };
        quiz.setStatus(next);
        Quiz saved = quizRepository.save(quiz);
        enforceSinglePublishedQuizPerCourse(saved);
        return quizMapper.toResponse(saved);
    }

    public void delete(Long id) {
        quizRepository.delete(load(id));
    }

    public long renameCourseTitle(String previousTitle, String nextTitle) {
        List<Quiz> quizzes = quizRepository.findAll().stream()
                .filter(quiz -> quiz.getCourse().equalsIgnoreCase(previousTitle))
                .toList();

        quizzes.forEach(quiz -> quiz.setCourse(nextTitle.trim()));
        quizRepository.saveAll(quizzes);
        return quizzes.size();
    }

    public long deleteByCourseTitle(String courseTitle) {
        List<Quiz> quizzes = quizRepository.findAll().stream()
                .filter(quiz -> quiz.getCourse().equalsIgnoreCase(courseTitle))
                .toList();

        quizRepository.deleteAll(quizzes);
        return quizzes.size();
    }

    @Transactional(readOnly = true)
    public QuizAnalyticsResponse analytics() {
        List<Quiz> quizzes = quizRepository.findAll();
        long total = quizzes.size();
        long published = quizzes.stream().filter(quiz -> quiz.getStatus() == QuizStatus.PUBLISHED).count();
        long draft = quizzes.stream().filter(quiz -> quiz.getStatus() == QuizStatus.DRAFT).count();
        long archived = quizzes.stream().filter(quiz -> quiz.getStatus() == QuizStatus.ARCHIVED).count();
        double averageQuestions = quizzes.stream().mapToInt(Quiz::getQuestions).average().orElse(0);
        Map<String, Long> difficulties = new LinkedHashMap<>();
        for (Quiz quiz : quizzes) {
            difficulties.merge(quiz.getDifficulty().name(), 1L, Long::sum);
        }
        return quizMapper.toAnalytics(total, published, draft, archived, averageQuestions, difficulties);
    }

    @Transactional(readOnly = true)
    public QuizAttemptResponse evaluate(Long id, QuizAttemptRequest request) {
        Quiz quiz = load(id);
        if (request.answers() == null) {
            throw new BadRequestException("Answers are required.");
        }

        List<QuizQuestionReview> review = quiz.getItems().stream()
                .map(question -> {
                    Integer selected = request.answers().get(question.getQuestionKey());
                    boolean correct = selected != null && selected.equals(question.getCorrectAnswer());
                    QuizDifficulty difficulty = question.getDifficulty() == null ? quiz.getDifficulty() : question.getDifficulty();
                    int weight = question.getWeight() == null ? weightFor(difficulty) : question.getWeight();
                    return new QuizQuestionReview(
                            question.getQuestionKey(),
                            question.getText(),
                            selected,
                            question.getCorrectAnswer(),
                            correct,
                            question.getExplanation(),
                            formatLabel(difficulty.name()),
                            weight,
                            correct ? weight : 0
                    );
                })
                .toList();

        long correctAnswers = review.stream().filter(QuizQuestionReview::correct).count();
        int totalQuestions = quiz.getItems().size();
        int totalWeight = review.stream().mapToInt(QuizQuestionReview::weight).sum();
        int earnedWeight = review.stream().mapToInt(QuizQuestionReview::earnedWeight).sum();
        double baseScore = totalWeight == 0 ? 0 : round((earnedWeight * 100.0) / totalWeight);
        double bonusPoints = 0;
        double penaltyPoints = 0;
        double score = baseScore;
        boolean passed = score >= quiz.getPassScore();
        QuizEmailNotification emailNotification = buildEmailNotification(quiz, request.learnerEmail(), review, score, passed);

        return new QuizAttemptResponse(
                correctAnswers,
                totalQuestions,
                baseScore,
                earnedWeight,
                totalWeight,
                bonusPoints,
                penaltyPoints,
                score,
                passed,
                review,
                emailNotification
        );
    }

    private Quiz load(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Quiz not found with id: " + id));
    }

    private void validate(QuizRequest request) {
        if (request.items().size() != request.questions()) {
            throw new BadRequestException("The number of quiz items must match the questions field.");
        }
        if (request.status() == QuizStatus.PUBLISHED && request.publishAt() == null) {
            throw new BadRequestException("A published quiz must include a publication date and time.");
        }
        long distinctIds = request.items().stream().map(item -> item.id().trim().toLowerCase(Locale.ROOT)).distinct().count();
        if (distinctIds != request.items().size()) {
            throw new BadRequestException("Each quiz question id must be unique.");
        }
    }


    private boolean contains(String value, String query) {
        return normalize(value).contains(query);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private int weightFor(QuizDifficulty difficulty) {
        QuizDifficulty safeDifficulty = difficulty == null ? QuizDifficulty.BEGINNER : difficulty;
        return switch (safeDifficulty) {
            case BEGINNER -> 1;
            case INTERMEDIATE -> 2;
            case ADVANCED -> 3;
        };
    }

    private void enforceSinglePublishedQuizPerCourse(Quiz currentQuiz) {
        if (currentQuiz.getStatus() != QuizStatus.PUBLISHED || !isAvailableForLearners(currentQuiz)) {
            return;
        }

        List<Quiz> quizzesToArchive = quizRepository.findAll().stream()
                .filter(quiz -> !quiz.getId().equals(currentQuiz.getId()))
                .filter(quiz -> quiz.getStatus() == QuizStatus.PUBLISHED)
                .filter(quiz -> quiz.getCourse().equalsIgnoreCase(currentQuiz.getCourse()))
                .toList();

        if (quizzesToArchive.isEmpty()) {
            return;
        }

        quizzesToArchive.forEach(quiz -> quiz.setStatus(QuizStatus.ARCHIVED));
        quizRepository.saveAll(quizzesToArchive);
    }

    private boolean isAvailableForLearners(Quiz quiz) {
        return quiz.getPublishAt() == null || !quiz.getPublishAt().isAfter(Instant.now());
    }

    private String formatLabel(String value) {
        String lower = value.toLowerCase(Locale.ROOT).replace('_', ' ');
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private QuizEmailNotification buildEmailNotification(
            Quiz quiz,
            String learnerEmail,
            List<QuizQuestionReview> review,
            double score,
            boolean passed
    ) {
        String normalizedEmail = learnerEmail.trim().toLowerCase(Locale.ROOT);
        long incorrectAnswers = review.stream().filter(item -> !item.correct()).count();
        long advancedMisses = review.stream()
                .filter(item -> !item.correct())
                .filter(item -> "Advanced".equalsIgnoreCase(item.difficulty()))
                .count();
        long intermediateMisses = review.stream()
                .filter(item -> !item.correct())
                .filter(item -> "Intermediate".equalsIgnoreCase(item.difficulty()))
                .count();

        List<String> highlights = new ArrayList<>();
        highlights.add("Score: " + score + "% on " + quiz.getTitle() + ".");
        highlights.add("Result: " + (passed ? "passed" : "not passed") + " with a target of " + quiz.getPassScore() + "%.");

        if (incorrectAnswers == 0) {
            highlights.add("You answered every question correctly.");
        } else if (advancedMisses > 0) {
            highlights.add("Main review area: advanced questions need more attention.");
        } else if (intermediateMisses > 0) {
            highlights.add("Main review area: intermediate questions need more practice.");
        } else {
            highlights.add("Main review area: revisit the core concepts before the next attempt.");
        }

        String subject = passed
                ? "Quiz passed: " + quiz.getTitle()
                : "Quiz result: review needed for " + quiz.getTitle();
        String preview = passed
                ? "Congratulations, you passed the quiz for " + quiz.getCourse() + " with " + score + "%."
                : "You scored " + score + "% on " + quiz.getCourse() + ". Review the highlighted topics before retrying.";
        String callToAction = passed
                ? "Continue to the next learning milestone or certificate flow."
                : "Review the course chapters and retry the quiz when you are ready.";
        QuizResultEmailService.DeliveryResult delivery = quizResultEmailService.sendResultEmail(
                normalizedEmail,
                subject,
                preview,
                callToAction,
                highlights
        );

        return new QuizEmailNotification(
                normalizedEmail,
                subject,
                preview,
                callToAction,
                highlights,
                delivery.delivered(),
                delivery.deliveryMode(),
                delivery.statusMessage()
        );
    }
}
