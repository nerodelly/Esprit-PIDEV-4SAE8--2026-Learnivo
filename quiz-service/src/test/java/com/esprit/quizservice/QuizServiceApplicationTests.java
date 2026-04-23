package com.esprit.quizservice;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
class QuizServiceApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldListSeededQuizzes() throws Exception {
        mockMvc.perform(get("/api/quizzes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(7));
    }

    @Test
    void shouldEvaluateQuizAttempt() throws Exception {
        mockMvc.perform(post("/api/quizzes/1/evaluate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "answers": {
                                    "fluency-1": 0,
                                    "fluency-2": 0,
                                    "fluency-3": 2
                                  },
                                  "learnerEmail": "demo@test.com"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.passed").value(true))
                .andExpect(jsonPath("$.baseScore").value(100.0))
                .andExpect(jsonPath("$.bonusPoints").value(0.0))
                .andExpect(jsonPath("$.score").value(100.0))
                .andExpect(jsonPath("$.emailNotification.recipient").value("demo@test.com"))
                .andExpect(jsonPath("$.emailNotification.delivered").value(false))
                .andExpect(jsonPath("$.emailNotification.deliveryMode").value("SIMULATED"));
    }

    @Test
    void shouldApplyIntelligentWeightedScoring() throws Exception {
        mockMvc.perform(post("/api/quizzes/4/evaluate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "answers": {
                                    "business-1": 0,
                                    "business-2": 1,
                                    "business-3": 0
                                  },
                                  "learnerEmail": "learner@test.com"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correctAnswers").value(2))
                .andExpect(jsonPath("$.earnedWeight").value(4))
                .andExpect(jsonPath("$.totalWeight").value(6))
                .andExpect(jsonPath("$.baseScore").value(66.7))
                .andExpect(jsonPath("$.bonusPoints").value(0.0))
                .andExpect(jsonPath("$.penaltyPoints").value(0.0))
                .andExpect(jsonPath("$.score").value(66.7))
                .andExpect(jsonPath("$.passed").value(false))
                .andExpect(jsonPath("$.emailNotification.subject").value("Quiz result: review needed for Business English Meeting Check"));
    }

    @Test
    void shouldArchivePreviousPublishedQuizForSameCourse() throws Exception {
        mockMvc.perform(post("/api/quizzes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Business English Replacement Quiz",
                                  "course": "Business English for Meetings and Presentations",
                                  "category": "Business English",
                                  "difficulty": "INTERMEDIATE",
                                  "questions": 3,
                                  "duration": "12 min",
                                  "passScore": 75,
                                  "status": "PUBLISHED",
                                  "publishAt": "2026-04-01T08:00:00Z",
                                  "items": [
                                    {
                                      "id": "replacement-1",
                                      "text": "Question 1",
                                      "options": ["A", "B", "C", "D"],
                                      "correctAnswer": 0,
                                      "explanation": "Explanation 1",
                                      "difficulty": "BEGINNER",
                                      "weight": 1
                                    },
                                    {
                                      "id": "replacement-2",
                                      "text": "Question 2",
                                      "options": ["A", "B", "C", "D"],
                                      "correctAnswer": 1,
                                      "explanation": "Explanation 2",
                                      "difficulty": "INTERMEDIATE",
                                      "weight": 2
                                    },
                                    {
                                      "id": "replacement-3",
                                      "text": "Question 3",
                                      "options": ["A", "B", "C", "D"],
                                      "correctAnswer": 2,
                                      "explanation": "Explanation 3",
                                      "difficulty": "ADVANCED",
                                      "weight": 3
                                    }
                                  ]
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/quizzes/by-course").param("courseTitle", "Business English for Meetings and Presentations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Business English Replacement Quiz"))
                .andExpect(jsonPath("$.items[0].difficulty").value("Beginner"))
                .andExpect(jsonPath("$.items[1].difficulty").value("Intermediate"))
                .andExpect(jsonPath("$.items[2].difficulty").value("Advanced"));
    }

    @Test
    void shouldHideScheduledPublishedQuizUntilPublishTime() throws Exception {
        mockMvc.perform(post("/api/quizzes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Future IELTS Quiz",
                                  "course": "IELTS Speaking Accelerator",
                                  "category": "Speaking",
                                  "difficulty": "INTERMEDIATE",
                                  "questions": 3,
                                  "duration": "15 min",
                                  "passScore": 75,
                                  "status": "PUBLISHED",
                                  "publishAt": "2099-01-01T10:00:00Z",
                                  "items": [
                                    {
                                      "id": "future-1",
                                      "text": "Question 1",
                                      "options": ["A", "B", "C", "D"],
                                      "correctAnswer": 0,
                                      "explanation": "Explanation 1",
                                      "difficulty": "BEGINNER",
                                      "weight": 1
                                    },
                                    {
                                      "id": "future-2",
                                      "text": "Question 2",
                                      "options": ["A", "B", "C", "D"],
                                      "correctAnswer": 1,
                                      "explanation": "Explanation 2",
                                      "difficulty": "INTERMEDIATE",
                                      "weight": 2
                                    },
                                    {
                                      "id": "future-3",
                                      "text": "Question 3",
                                      "options": ["A", "B", "C", "D"],
                                      "correctAnswer": 2,
                                      "explanation": "Explanation 3",
                                      "difficulty": "ADVANCED",
                                      "weight": 3
                                    }
                                  ]
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/quizzes/by-course").param("courseTitle", "IELTS Speaking Accelerator"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("IELTS Speaking Band Booster Quiz"));
    }

    @Test
    void shouldRenameCourseTitleAcrossMatchingQuizzes() throws Exception {
        mockMvc.perform(patch("/api/quizzes/sync/course-title")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "previousTitle": "Speak Fluent English in 30 Days - No Boring Grammar Rules!",
                                  "nextTitle": "Speak Fluent English Updated"
                                }
                                """))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/quizzes/by-course").param("courseTitle", "Speak Fluent English Updated"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.course").value("Speak Fluent English Updated"));
    }
}
