package com.esprit.quizservice.repository;

import com.esprit.quizservice.domain.QuizStatus;
import com.esprit.quizservice.entity.Quiz;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    Optional<Quiz> findFirstByCourseIgnoreCaseAndStatusOrderByUpdatedAtDesc(String course, QuizStatus status);
}
