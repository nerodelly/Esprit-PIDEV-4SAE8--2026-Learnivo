package com.esprit.courseservice;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class CourseServiceApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldListSeededCourses() throws Exception {
        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(7))
                .andExpect(jsonPath("$[0].difficultyScore").exists())
                .andExpect(jsonPath("$[0].difficultyLabel").isString());
    }

    @Test
    void shouldExposeAnalytics() throws Exception {
        mockMvc.perform(get("/api/courses/analytics/overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCourses").value(7))
                .andExpect(jsonPath("$.publishedCourses").value(6));
    }

    @Test
    void shouldExposeProgressForSeededCourse() throws Exception {
        mockMvc.perform(get("/api/courses/1/progress"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedChapters").value(0))
                .andExpect(jsonPath("$.totalChapters").value(3))
                .andExpect(jsonPath("$.progressPercent").value(0.0))
                .andExpect(jsonPath("$.quizUnlocked").value(false))
                .andExpect(jsonPath("$.quizStatus").value("NOT_STARTED"));
    }

    @Test
    void shouldReturnEightyPercentWhenQuizFailsAfterAllChaptersComplete() throws Exception {
        long courseId = createCompletedCourse();

        mockMvc.perform(get("/api/courses/" + courseId + "/progress")
                        .param("quizStatus", "FAILED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedChapters").value(2))
                .andExpect(jsonPath("$.chapterProgressPercent").value(50.0))
                .andExpect(jsonPath("$.progressPercent").value(80.0))
                .andExpect(jsonPath("$.quizUnlocked").value(true));
    }

    @Test
    void shouldReturnHundredPercentWhenQuizPassesAfterAllChaptersComplete() throws Exception {
        long courseId = createCompletedCourse();

        mockMvc.perform(get("/api/courses/" + courseId + "/progress")
                        .param("quizStatus", "PASSED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedChapters").value(2))
                .andExpect(jsonPath("$.chapterProgressPercent").value(50.0))
                .andExpect(jsonPath("$.progressPercent").value(100.0))
                .andExpect(jsonPath("$.quizUnlocked").value(true));
    }

    @Test
    void shouldExposeCalculatedDifficultyBreakdown() throws Exception {
        long courseId = createCompletedCourse();

        mockMvc.perform(get("/api/courses/" + courseId + "/difficulty"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courseId").value(courseId))
                .andExpect(jsonPath("$.difficultyScore").value(39.0))
                .andExpect(jsonPath("$.difficultyLabel").value("Intermediate"))
                .andExpect(jsonPath("$.chapterLoad").value(16.0))
                .andExpect(jsonPath("$.sectionDensity").value(9.0))
                .andExpect(jsonPath("$.durationLoad").value(8.0))
                .andExpect(jsonPath("$.deliveryComplexity").value(6.0));
    }

    private long createCompletedCourse() throws Exception {
        String response = mockMvc.perform(post("/api/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Backend Progress Validation Course",
                                  "description": "This course exists to validate backend progress rules with fully completed chapters.",
                                  "type": "BLENDED_COURSE",
                                  "status": "PUBLISHED",
                                  "level": "Beginner",
                                  "image": "/images/training-1.jpg",
                                  "banner": "/images/course-banner.jpg",
                                  "instructor": "QA Teacher",
                                  "category": "Testing",
                                  "chapters": 2,
                                  "duration": "2 weeks",
                                  "chaptersData": [
                                    {
                                      "name": "Chapter One",
                                      "number": 1,
                                      "pdfUrl": "chapter-one.pdf",
                                      "sections": [
                                        { "name": "Lesson 1", "completed": true },
                                        { "name": "Lesson 2", "completed": true }
                                      ]
                                    },
                                    {
                                      "name": "Chapter Two",
                                      "number": 2,
                                      "pdfUrl": "chapter-two.pdf",
                                      "sections": [
                                        { "name": "Lesson 1", "completed": true }
                                      ]
                                    }
                                  ]
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).path("id").asLong();
    }
}
