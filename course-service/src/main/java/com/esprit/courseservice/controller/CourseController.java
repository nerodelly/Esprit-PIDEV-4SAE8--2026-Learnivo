package com.esprit.courseservice.controller;

import com.esprit.courseservice.domain.CourseStatus;
import com.esprit.courseservice.domain.CourseType;
import com.esprit.courseservice.domain.CourseQuizProgressStatus;
import com.esprit.courseservice.dto.CourseAssetUploadResponse;
import com.esprit.courseservice.dto.CourseDtos.CourseAnalyticsResponse;
import com.esprit.courseservice.dto.CourseDtos.CourseDifficultyResponse;
import com.esprit.courseservice.dto.CourseDtos.CourseProgressResponse;
import com.esprit.courseservice.dto.CourseDtos.CourseRequest;
import com.esprit.courseservice.dto.CourseDtos.CourseResponse;
import com.esprit.courseservice.service.CourseAssetStorageService;
import com.esprit.courseservice.service.CourseService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;
    private final CourseAssetStorageService courseAssetStorageService;

    public CourseController(CourseService courseService, CourseAssetStorageService courseAssetStorageService) {
        this.courseService = courseService;
        this.courseAssetStorageService = courseAssetStorageService;
    }

    @GetMapping
    public List<CourseResponse> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) CourseStatus status,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) CourseType type
    ) {
        return courseService.findAll(search, status, level, category, type);
    }

    @GetMapping("/{id}")
    public CourseResponse findById(@PathVariable Long id) {
        return courseService.findById(id);
    }

    @GetMapping("/slug/{slug}")
    public CourseResponse findBySlug(@PathVariable String slug) {
        return courseService.findBySlug(slug);
    }

    @GetMapping("/{id}/progress")
    public CourseProgressResponse progress(
            @PathVariable Long id,
            @RequestParam(defaultValue = "NOT_STARTED") CourseQuizProgressStatus quizStatus
    ) {
        return courseService.progress(id, quizStatus);
    }

    @GetMapping("/{id}/difficulty")
    public CourseDifficultyResponse difficulty(@PathVariable Long id) {
        return courseService.difficulty(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CourseResponse create(@Valid @RequestBody CourseRequest request) {
        return courseService.create(request);
    }

    @PostMapping(path = "/assets/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public CourseAssetUploadResponse uploadCover(@RequestParam("file") MultipartFile file) {
        return new CourseAssetUploadResponse(courseAssetStorageService.storeCoverImage(file));
    }

    @PostMapping(path = "/assets/chapter-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public CourseAssetUploadResponse uploadChapterPdf(@RequestParam("file") MultipartFile file) {
        return new CourseAssetUploadResponse(courseAssetStorageService.storeChapterPdf(file));
    }

    @PutMapping("/{id}")
    public CourseResponse update(@PathVariable Long id, @Valid @RequestBody CourseRequest request) {
        return courseService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public CourseResponse updateStatus(@PathVariable Long id, @RequestParam(required = false) CourseStatus status) {
        return status == null ? courseService.toggleStatus(id) : courseService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        courseService.delete(id);
    }

    @GetMapping("/analytics/overview")
    public CourseAnalyticsResponse analytics() {
        return courseService.analytics();
    }
}
