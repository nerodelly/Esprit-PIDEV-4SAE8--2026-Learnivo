package com.esprit.courseservice.service;

import com.esprit.courseservice.client.QuizServiceFeignClient;
import com.esprit.courseservice.dto.QuizSyncDtos.CourseRenameRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class QuizServiceClient {

    private static final Logger log = LoggerFactory.getLogger(QuizServiceClient.class);

    private final QuizServiceFeignClient quizServiceFeignClient;

    public QuizServiceClient(QuizServiceFeignClient quizServiceFeignClient) {
        this.quizServiceFeignClient = quizServiceFeignClient;
    }

    public void renameCourse(String previousTitle, String nextTitle) {
        try {
            quizServiceFeignClient.renameCourseTitle(new CourseRenameRequest(previousTitle, nextTitle));
        } catch (RuntimeException exception) {
            log.warn("Failed to sync quiz course title from '{}' to '{}': {}", previousTitle, nextTitle, exception.getMessage());
        }
    }

    public void deleteByCourseTitle(String courseTitle) {
        try {
            quizServiceFeignClient.deleteByCourseTitle(courseTitle);
        } catch (RuntimeException exception) {
            log.warn("Failed to delete quizzes for course '{}': {}", courseTitle, exception.getMessage());
        }
    }
}
