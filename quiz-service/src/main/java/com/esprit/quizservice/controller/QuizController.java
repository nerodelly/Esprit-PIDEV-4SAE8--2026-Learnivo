package com.esprit.quizservice.controller;

import com.esprit.quizservice.domain.QuizStatus;
import com.esprit.quizservice.dto.QuizSyncDtos.CourseRenameRequest;
import com.esprit.quizservice.dto.QuizDtos.QuizAnalyticsResponse;
import com.esprit.quizservice.dto.QuizDtos.QuizAttemptRequest;
import com.esprit.quizservice.dto.QuizDtos.QuizAttemptResponse;
import com.esprit.quizservice.dto.QuizDtos.QuizRequest;
import com.esprit.quizservice.dto.QuizDtos.QuizResponse;
import com.esprit.quizservice.service.QuizService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping
    public List<QuizResponse> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) QuizStatus status,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String course
    ) {
        return quizService.findAll(search, status, difficulty, category, course);
    }

    @GetMapping("/{id}")
    public QuizResponse findById(@PathVariable Long id) {
        return quizService.findById(id);
    }

    @GetMapping("/by-course")
    public QuizResponse findPublishedByCourse(@RequestParam String courseTitle) {
        return quizService.findPublishedByCourse(courseTitle);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public QuizResponse create(@Valid @RequestBody QuizRequest request) {
        return quizService.create(request);
    }

    @PutMapping("/{id}")
    public QuizResponse update(@PathVariable Long id, @Valid @RequestBody QuizRequest request) {
        return quizService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public QuizResponse updateStatus(@PathVariable Long id, @RequestParam(required = false) QuizStatus status) {
        return status == null ? quizService.toggleStatus(id) : quizService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        quizService.delete(id);
    }

    @PatchMapping("/sync/course-title")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void renameCourseTitle(@Valid @RequestBody CourseRenameRequest request) {
        quizService.renameCourseTitle(request.previousTitle(), request.nextTitle());
    }

    @DeleteMapping("/sync/by-course")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteByCourseTitle(@RequestParam String courseTitle) {
        quizService.deleteByCourseTitle(courseTitle);
    }

    @PostMapping("/{id}/evaluate")
    public QuizAttemptResponse evaluate(@PathVariable Long id, @Valid @RequestBody QuizAttemptRequest request) {
        return quizService.evaluate(id, request);
    }

    @GetMapping("/analytics/overview")
    public QuizAnalyticsResponse analytics() {
        return quizService.analytics();
    }
}
