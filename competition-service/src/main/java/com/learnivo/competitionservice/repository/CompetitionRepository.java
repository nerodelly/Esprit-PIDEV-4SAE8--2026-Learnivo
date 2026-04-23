package com.learnivo.competitionservice.repository;

import com.learnivo.competitionservice.entity.Competition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompetitionRepository extends JpaRepository<Competition, Long> {

    List<Competition> findByStatus(Competition.Status status);

    List<Competition> findByCategory(String category);

    List<Competition> findAllByOrderByIdDesc();

    /** Compétitions actives (UPCOMING ou ONGOING) avec des participants inscrits */
    @Query("SELECT DISTINCT c FROM Competition c JOIN c.participants p " +
           "WHERE c.status IN ('UPCOMING', 'ONGOING') AND c.deadline IS NOT NULL")
    List<Competition> findActiveWithParticipants();

    @Query("SELECT DISTINCT c FROM Competition c JOIN c.participants p WHERE LOWER(p.email) = LOWER(:email)")
    List<Competition> findByParticipantEmailString(@org.springframework.data.repository.query.Param("email") String email);
}
