package org.example.imedbackend.repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import org.example.imedbackend.entity.InternshipEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface InternshipEvaluationRepository extends JpaRepository<InternshipEvaluation, Long> {
    @Query("select ie from InternshipEvaluation ie join ie.application ia")
    List<InternshipEvaluation> findAllWithExistingApplication();

    @Query("select ie from InternshipEvaluation ie join ie.application ia where ie.id = :id")
    Optional<InternshipEvaluation> findByIdWithExistingApplication(Long id);

    @Modifying
    @Query("update InternshipEvaluation ie set ie.score = :score, ie.feedback = :feedback, ie.evaluatedAt = :evaluatedAt, ie.application.id = :applicationId where ie.id = :id")
    int updateByIdNative(Long id, double score, String feedback, LocalDateTime evaluatedAt, Long applicationId);

    @Modifying
    @Query("delete from InternshipEvaluation ie where ie.id = :id")
    int deleteByIdNative(Long id);
}
