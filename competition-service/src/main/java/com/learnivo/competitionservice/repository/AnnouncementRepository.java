package com.learnivo.competitionservice.repository;

import com.learnivo.competitionservice.entity.CompetitionAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<CompetitionAnnouncement, Long> {

    List<CompetitionAnnouncement> findByCompetitionIdOrderByCreatedAtDesc(Long competitionId);
}
