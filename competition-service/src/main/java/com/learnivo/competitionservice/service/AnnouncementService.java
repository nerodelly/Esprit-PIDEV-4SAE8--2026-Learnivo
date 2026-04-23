package com.learnivo.competitionservice.service;

import com.learnivo.competitionservice.dto.AnnouncementDTO;
import com.learnivo.competitionservice.entity.CompetitionAnnouncement;
import com.learnivo.competitionservice.exception.ResourceNotFoundException;
import com.learnivo.competitionservice.repository.AnnouncementRepository;
import com.learnivo.competitionservice.repository.CompetitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final CompetitionRepository competitionRepository;

    @Transactional(readOnly = true)
    public List<CompetitionAnnouncement> getByCompetition(Long competitionId) {
        if (!competitionRepository.existsById(competitionId))
            throw new ResourceNotFoundException("Competition non trouvée avec l'id: " + competitionId);
        return announcementRepository.findByCompetitionIdOrderByCreatedAtDesc(competitionId);
    }

    public CompetitionAnnouncement post(Long competitionId, AnnouncementDTO dto) {
        if (!competitionRepository.existsById(competitionId))
            throw new ResourceNotFoundException("Competition non trouvée avec l'id: " + competitionId);

        CompetitionAnnouncement.AnnouncementType type;
        try {
            type = CompetitionAnnouncement.AnnouncementType.valueOf(
                    (dto.getType() != null ? dto.getType() : "INFO").toUpperCase());
        } catch (IllegalArgumentException e) {
            type = CompetitionAnnouncement.AnnouncementType.INFO;
        }

        CompetitionAnnouncement announcement = CompetitionAnnouncement.builder()
                .competitionId(competitionId)
                .title(dto.getTitle())
                .content(dto.getContent())
                .type(type)
                .build();

        return announcementRepository.save(announcement);
    }

    public void delete(Long id) {
        if (!announcementRepository.existsById(id))
            throw new ResourceNotFoundException("Annonce non trouvée avec l'id: " + id);
        announcementRepository.deleteById(id);
    }
}
