package com.esprit.courseservice.config;

import com.esprit.courseservice.domain.CourseStatus;
import com.esprit.courseservice.domain.CourseType;
import com.esprit.courseservice.dto.CourseDtos.CourseChapterRequest;
import com.esprit.courseservice.dto.CourseDtos.CourseRequest;
import com.esprit.courseservice.dto.CourseDtos.CourseSectionRequest;
import com.esprit.courseservice.repository.CourseRepository;
import com.esprit.courseservice.service.CourseService;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedCourses(CourseRepository courseRepository, CourseService courseService) {
        return args -> {
            if (courseRepository.count() > 0) {
                return;
            }

            courseService.create(new CourseRequest(
                    "Speak Fluent English in 30 Days - No Boring Grammar Rules!",
                    "Struggling to speak confidently? This course focuses on real-world conversations, confidence building, and pronunciation habits that make learners speak more naturally.",
                    CourseType.BLENDED_COURSE,
                    CourseStatus.PUBLISHED,
                    "Beginner",
                    "/images/training-1.jpg",
                    "/images/course-banner.jpg",
                    "Dr. Sarah Wilson",
                    "Speaking",
                    3,
                    "4 weeks",
                    List.of(
                            new CourseChapterRequest("Introduction to Fluency", 1, "chapter-1.pdf",
                                    List.of(
                                            new CourseSectionRequest("Overcoming Fear of Speaking", false),
                                            new CourseSectionRequest("Building Consistency", true)
                                    )),
                            new CourseChapterRequest("Real-world Conversations", 2, "chapter-2.pdf", List.of()),
                            new CourseChapterRequest("Pronunciation Hacks", 3, "chapter-3.pdf", List.of())
                    )
            ));

            courseService.create(new CourseRequest(
                    "The Ultimate English Writing Masterclass: From Beginner to Pro!",
                    "This course teaches learners how to structure essays, sharpen vocabulary, and write with clarity across email, academic, and creative formats.",
                    CourseType.LIVE_CLASSES,
                    CourseStatus.PUBLISHED,
                    "Mid-level",
                    "/images/training-2.jpg",
                    "/images/course-banner.jpg",
                    "Mark Thompson",
                    "Writing",
                    2,
                    "6 weeks",
                    List.of(
                            new CourseChapterRequest("Writing Foundations", 1, "writing-1.pdf", List.of()),
                            new CourseChapterRequest("Powerful Editing", 2, "writing-2.pdf", List.of())
                    )
            ));

            courseService.create(new CourseRequest(
                    "Accent Makeover: Sound Like a Native in Just Weeks!",
                    "Learners practice rhythm, intonation, and pronunciation drills that improve speech clarity and reduce hesitation in spoken English.",
                    CourseType.LIVE_CLASSES,
                    CourseStatus.DRAFT,
                    "Advanced",
                    "/images/training-3.jpg",
                    "/images/course-banner.jpg",
                    "Emma Watson",
                    "Pronunciation",
                    2,
                    "3 weeks",
                    List.of(
                            new CourseChapterRequest("Rhythm Training", 1, "accent-1.pdf", List.of()),
                            new CourseChapterRequest("Intonation Practice", 2, "accent-2.pdf", List.of())
                    )
            ));

            courseService.create(new CourseRequest(
                    "Business English for Meetings and Presentations",
                    "This course helps learners lead meetings, present ideas clearly, and speak professionally in workplace situations with confidence and accuracy.",
                    CourseType.BLENDED_COURSE,
                    CourseStatus.PUBLISHED,
                    "Intermediate",
                    "/images/training-1.jpg",
                    "/images/course-banner.jpg",
                    "Olivia Bennett",
                    "Business English",
                    3,
                    "5 weeks",
                    List.of(
                            new CourseChapterRequest("Meeting Vocabulary Essentials", 1, "business-1.pdf",
                                    List.of(
                                            new CourseSectionRequest("Opening a meeting", true),
                                            new CourseSectionRequest("Asking for clarification", true)
                                    )),
                            new CourseChapterRequest("Presenting Ideas with Structure", 2, "business-2.pdf",
                                    List.of(
                                            new CourseSectionRequest("Signposting your points", false),
                                            new CourseSectionRequest("Handling questions", false)
                                    )),
                            new CourseChapterRequest("Professional Follow-up", 3, "business-3.pdf", List.of())
                    )
            ));

            courseService.create(new CourseRequest(
                    "IELTS Speaking Accelerator",
                    "Learners prepare for IELTS speaking tasks through timed answers, fluency drills, and feedback strategies designed to improve band performance.",
                    CourseType.BLENDED_COURSE,
                    CourseStatus.PUBLISHED,
                    "Upper-intermediate",
                    "/images/training-2.jpg",
                    "/images/course-banner.jpg",
                    "Daniel Carter",
                    "Exam Preparation",
                    3,
                    "6 weeks",
                    List.of(
                            new CourseChapterRequest("Part 1 Confidence Builders", 1, "ielts-1.pdf",
                                    List.of(
                                            new CourseSectionRequest("Personal introduction answers", true),
                                            new CourseSectionRequest("Expanding short answers", true)
                                    )),
                            new CourseChapterRequest("Part 2 Long Turn Mastery", 2, "ielts-2.pdf",
                                    List.of(
                                            new CourseSectionRequest("Using preparation time well", false),
                                            new CourseSectionRequest("Structuring a 2-minute answer", false)
                                    )),
                            new CourseChapterRequest("Part 3 Discussion Skills", 3, "ielts-3.pdf", List.of())
                    )
            ));

            courseService.create(new CourseRequest(
                    "Everyday English Listening Lab",
                    "This listening course trains learners to catch key details, understand natural speed, and improve comprehension through practical audio scenarios.",
                    CourseType.LIVE_CLASSES,
                    CourseStatus.PUBLISHED,
                    "Beginner",
                    "/images/training-3.jpg",
                    "/images/course-banner.jpg",
                    "Sophie Martin",
                    "Listening",
                    3,
                    "4 weeks",
                    List.of(
                            new CourseChapterRequest("Listening for Key Words", 1, "listening-1.pdf",
                                    List.of(
                                            new CourseSectionRequest("Predicting topic words", true),
                                            new CourseSectionRequest("Recognizing repeated words", false)
                                    )),
                            new CourseChapterRequest("Understanding Everyday Dialogues", 2, "listening-2.pdf", List.of()),
                            new CourseChapterRequest("Listening Under Real Speed", 3, "listening-3.pdf", List.of())
                    )
            ));

            courseService.create(new CourseRequest(
                    "English Grammar Bootcamp for Real Communication",
                    "The course revises grammar in context so learners can speak and write more accurately without memorizing isolated rules.",
                    CourseType.BLENDED_COURSE,
                    CourseStatus.PUBLISHED,
                    "Intermediate",
                    "/images/training-2.jpg",
                    "/images/course-banner.jpg",
                    "Hannah Reed",
                    "Grammar",
                    3,
                    "5 weeks",
                    List.of(
                            new CourseChapterRequest("Present and Past Foundations", 1, "grammar-1.pdf",
                                    List.of(
                                            new CourseSectionRequest("Present simple vs present continuous", true),
                                            new CourseSectionRequest("Past simple review", true)
                                    )),
                            new CourseChapterRequest("Perfect Tenses in Context", 2, "grammar-2.pdf",
                                    List.of(
                                            new CourseSectionRequest("Present perfect for experience", true),
                                            new CourseSectionRequest("Past perfect in storytelling", true)
                                    )),
                            new CourseChapterRequest("Conditionals and Modal Accuracy", 3, "grammar-3.pdf",
                                    List.of(
                                            new CourseSectionRequest("First and second conditional", false),
                                            new CourseSectionRequest("Modals for advice and obligation", false)
                                    ))
                    )
            ));
        };
    }
}
