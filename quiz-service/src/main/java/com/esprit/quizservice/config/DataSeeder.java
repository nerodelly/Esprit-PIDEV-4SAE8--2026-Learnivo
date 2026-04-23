package com.esprit.quizservice.config;

import com.esprit.quizservice.domain.QuizDifficulty;
import com.esprit.quizservice.domain.QuizStatus;
import com.esprit.quizservice.dto.QuizDtos.QuizQuestionRequest;
import com.esprit.quizservice.dto.QuizDtos.QuizRequest;
import com.esprit.quizservice.repository.QuizRepository;
import com.esprit.quizservice.service.QuizService;
import java.time.Instant;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    private static final Instant DEFAULT_PUBLISH_AT = Instant.parse("2026-04-01T08:00:00Z");

    @Bean
    CommandLineRunner seedQuizzes(QuizRepository quizRepository, QuizService quizService) {
        return args -> {
            if (quizRepository.count() > 0) {
                return;
            }

            quizService.create(new QuizRequest(
                    "Fluency Checkpoint",
                    "Speak Fluent English in 30 Days - No Boring Grammar Rules!",
                    "Speaking",
                    QuizDifficulty.BEGINNER,
                    3,
                    "10 min",
                    70,
                    QuizStatus.PUBLISHED,
                    DEFAULT_PUBLISH_AT,
                    List.of(
                            new QuizQuestionRequest("fluency-1", "What is the main focus of the course?", List.of("Real-world conversation", "Silent reading only", "Coding syntax", "Translation drills only"), 0, "The course focuses on practical speaking.", QuizDifficulty.BEGINNER, 1),
                            new QuizQuestionRequest("fluency-2", "What helps learners build consistency?", List.of("Daily speaking habits", "Avoiding feedback", "Skipping practice", "Memorizing random lists"), 0, "Consistency comes from repeated practice.", QuizDifficulty.INTERMEDIATE, 2),
                            new QuizQuestionRequest("fluency-3", "What score is needed to pass?", List.of("50%", "60%", "70%", "100%"), 2, "This quiz requires at least 70%.", QuizDifficulty.BEGINNER, 1)
                    )
            ));

            quizService.create(new QuizRequest(
                    "Writing Masterclass Assessment",
                    "The Ultimate English Writing Masterclass: From Beginner to Pro!",
                    "Writing",
                    QuizDifficulty.INTERMEDIATE,
                    2,
                    "12 min",
                    75,
                    QuizStatus.DRAFT,
                    null,
                    List.of(
                            new QuizQuestionRequest("writing-1", "What skill does the course improve?", List.of("Clear writing structure", "Football strategy", "Database indexing", "Graphic animation"), 0, "The course is about writing quality."),
                            new QuizQuestionRequest("writing-2", "Which format fits the duration field?", List.of("6 weeks", "15 min", "soon", "later"), 1, "Quiz durations use minute-based labels.")
                    )
            ));

            quizService.create(new QuizRequest(
                    "Accent Precision Review",
                    "Accent Makeover: Sound Like a Native in Just Weeks!",
                    "Pronunciation",
                    QuizDifficulty.ADVANCED,
                    2,
                    "15 min",
                    80,
                    QuizStatus.ARCHIVED,
                    null,
                    List.of(
                            new QuizQuestionRequest("accent-1", "Which speech feature is covered?", List.of("Intonation", "Spreadsheet formulas", "Router config", "Photo filters"), 0, "The course covers intonation."),
                            new QuizQuestionRequest("accent-2", "How many options must each question include?", List.of("2", "3", "4", "5"), 2, "The frontend expects 4 options per question.")
                    )
            ));

            quizService.create(new QuizRequest(
                    "Business English Meeting Check",
                    "Business English for Meetings and Presentations",
                    "Business English",
                    QuizDifficulty.INTERMEDIATE,
                    3,
                    "14 min",
                    75,
                    QuizStatus.PUBLISHED,
                    DEFAULT_PUBLISH_AT,
                    List.of(
                            new QuizQuestionRequest("business-1", "What is a useful way to open a meeting professionally?", List.of("State the agenda clearly", "Stay silent for one minute", "Change the topic randomly", "Read a poem"), 0, "Professional meetings usually begin with a clear agenda.", QuizDifficulty.BEGINNER, 1),
                            new QuizQuestionRequest("business-2", "What helps when presenting ideas clearly?", List.of("Using signposting language", "Speaking as fast as possible", "Skipping structure", "Avoiding examples"), 0, "Signposting helps listeners follow the presentation.", QuizDifficulty.INTERMEDIATE, 2),
                            new QuizQuestionRequest("business-3", "What should you do after a meeting?", List.of("Send a follow-up summary", "Ignore all decisions", "Delete your notes immediately", "Switch languages without notice"), 0, "A short summary keeps everyone aligned.", QuizDifficulty.ADVANCED, 3)
                    )
            ));

            quizService.create(new QuizRequest(
                    "IELTS Speaking Band Booster Quiz",
                    "IELTS Speaking Accelerator",
                    "Exam Preparation",
                    QuizDifficulty.ADVANCED,
                    3,
                    "15 min",
                    80,
                    QuizStatus.PUBLISHED,
                    DEFAULT_PUBLISH_AT,
                    List.of(
                            new QuizQuestionRequest("ielts-1", "What improves your Part 1 answers most?", List.of("Expanding answers naturally", "Giving one-word replies only", "Memorizing dictionary pages", "Avoiding eye contact"), 0, "Expanded but natural answers improve fluency and coherence.", QuizDifficulty.INTERMEDIATE, 2),
                            new QuizQuestionRequest("ielts-2", "During Part 2, what should learners manage carefully?", List.of("Preparation time", "Laptop battery", "Room decoration", "Examiner's accent"), 0, "Preparation time is essential to structure the long turn.", QuizDifficulty.ADVANCED, 3),
                            new QuizQuestionRequest("ielts-3", "What is tested strongly in Part 3?", List.of("Discussion and justification skills", "Spelling every word aloud", "Typing speed", "Translation into French"), 0, "Part 3 focuses on deeper discussion and justification.", QuizDifficulty.ADVANCED, 3)
                    )
            ));

            quizService.create(new QuizRequest(
                    "Listening Lab Quick Assessment",
                    "Everyday English Listening Lab",
                    "Listening",
                    QuizDifficulty.BEGINNER,
                    3,
                    "10 min",
                    70,
                    QuizStatus.PUBLISHED,
                    DEFAULT_PUBLISH_AT,
                    List.of(
                            new QuizQuestionRequest("listening-1", "What helps before listening to audio?", List.of("Predicting key words", "Muting the sound", "Closing the transcript forever", "Ignoring the title"), 0, "Prediction activates useful vocabulary before listening."),
                            new QuizQuestionRequest("listening-2", "Why are repeated words useful?", List.of("They highlight important information", "They always mean the speaker is angry", "They replace grammar completely", "They end the conversation"), 0, "Repeated words often signal key details."),
                            new QuizQuestionRequest("listening-3", "What skill is trained in this course?", List.of("Understanding natural-speed English", "Writing SQL queries", "Photo editing", "Debugging Java bytecode"), 0, "The course focuses on practical listening comprehension.")
                    )
            ));

            quizService.create(new QuizRequest(
                    "Grammar Bootcamp Final Check",
                    "English Grammar Bootcamp for Real Communication",
                    "Grammar",
                    QuizDifficulty.INTERMEDIATE,
                    4,
                    "16 min",
                    75,
                    QuizStatus.PUBLISHED,
                    DEFAULT_PUBLISH_AT,
                    List.of(
                            new QuizQuestionRequest("grammar-1", "Which tense describes routines?", List.of("Present simple", "Past perfect", "Future perfect continuous", "Conditional perfect"), 0, "Present simple is commonly used for habits and routines.", QuizDifficulty.BEGINNER, 1),
                            new QuizQuestionRequest("grammar-2", "Which tense often describes life experience?", List.of("Present perfect", "Past continuous", "Future simple", "Past simple only"), 0, "Present perfect is often used for life experience.", QuizDifficulty.INTERMEDIATE, 2),
                            new QuizQuestionRequest("grammar-3", "Which structure talks about real future possibilities?", List.of("First conditional", "Third conditional", "Reported speech only", "Passive infinitive"), 0, "First conditional is used for real future possibilities.", QuizDifficulty.INTERMEDIATE, 2),
                            new QuizQuestionRequest("grammar-4", "What do modal verbs often express?", List.of("Advice, obligation, or possibility", "Only color preferences", "Only noun plurals", "Only article rules"), 0, "Modals commonly express advice, obligation, and possibility.", QuizDifficulty.ADVANCED, 3)
                    )
            ));
        };
    }
}
