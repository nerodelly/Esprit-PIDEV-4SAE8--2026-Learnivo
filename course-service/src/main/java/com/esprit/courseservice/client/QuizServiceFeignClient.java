package com.esprit.courseservice.client;

import com.esprit.courseservice.dto.QuizSyncDtos.CourseRenameRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "${quiz.service.name:quiz-service}")
public interface QuizServiceFeignClient {

    @PatchMapping("/api/quizzes/sync/course-title")
    void renameCourseTitle(@RequestBody CourseRenameRequest request);

    @DeleteMapping("/api/quizzes/sync/by-course")
    void deleteByCourseTitle(@RequestParam("courseTitle") String courseTitle);
}
