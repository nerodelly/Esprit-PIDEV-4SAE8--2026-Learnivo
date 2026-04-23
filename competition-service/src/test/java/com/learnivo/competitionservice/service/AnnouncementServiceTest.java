package com.learnivo.competitionservice.service;

import com.learnivo.competitionservice.dto.AnnouncementDTO;
import com.learnivo.competitionservice.entity.CompetitionAnnouncement;
import com.learnivo.competitionservice.exception.ResourceNotFoundException;
import com.learnivo.competitionservice.repository.AnnouncementRepository;
import com.learnivo.competitionservice.repository.CompetitionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AnnouncementService – Unit Tests")
class AnnouncementServiceTest {

    @Mock
    private AnnouncementRepository announcementRepository;

    @Mock
    private CompetitionRepository competitionRepository;

    @InjectMocks
    private AnnouncementService announcementService;

    private Long competitionId = 1L;

    @BeforeEach
    void setUp() {
    }

    @Test
    @DisplayName("getByCompetition() returns list when competition exists")
    void getByCompetition_success() {
        when(competitionRepository.existsById(competitionId)).thenReturn(true);
        CompetitionAnnouncement announcement = CompetitionAnnouncement.builder()
                .id(10L).competitionId(competitionId).title("Test Announcement").build();
        when(announcementRepository.findByCompetitionIdOrderByCreatedAtDesc(competitionId))
                .thenReturn(List.of(announcement));

        List<CompetitionAnnouncement> result = announcementService.getByCompetition(competitionId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Test Announcement");
    }

    @Test
    @DisplayName("getByCompetition() throws ResourceNotFoundException when competition does not exist")
    void getByCompetition_notFound() {
        when(competitionRepository.existsById(competitionId)).thenReturn(false);

        assertThatThrownBy(() -> announcementService.getByCompetition(competitionId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Competition non trouvée");
    }

    @Test
    @DisplayName("post() saves and returns a new announcement")
    void post_success() {
        when(competitionRepository.existsById(competitionId)).thenReturn(true);
        AnnouncementDTO dto = new AnnouncementDTO();
        dto.setTitle("New Update");
        dto.setContent("Everything is fine.");
        dto.setType("INFO");

        when(announcementRepository.save(any(CompetitionAnnouncement.class))).thenAnswer(inv -> {
            CompetitionAnnouncement saved = inv.getArgument(0);
            saved.setId(100L);
            return saved;
        });

        CompetitionAnnouncement result = announcementService.post(competitionId, dto);

        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getTitle()).isEqualTo("New Update");
        assertThat(result.getType()).isEqualTo(CompetitionAnnouncement.AnnouncementType.INFO);
        verify(announcementRepository).save(any(CompetitionAnnouncement.class));
    }

    @Test
    @DisplayName("post() defaults to INFO type when type is invalid")
    void post_invalidType_defaultsToInfo() {
        when(competitionRepository.existsById(competitionId)).thenReturn(true);
        AnnouncementDTO dto = new AnnouncementDTO();
        dto.setTitle("New Update");
        dto.setType("INVALID_TYPE");

        when(announcementRepository.save(any(CompetitionAnnouncement.class))).thenAnswer(inv -> inv.getArgument(0));

        CompetitionAnnouncement result = announcementService.post(competitionId, dto);

        assertThat(result.getType()).isEqualTo(CompetitionAnnouncement.AnnouncementType.INFO);
    }

    @Test
    @DisplayName("delete() deletes announcement when it exists")
    void delete_success() {
        Long announcementId = 50L;
        when(announcementRepository.existsById(announcementId)).thenReturn(true);

        announcementService.delete(announcementId);

        verify(announcementRepository).deleteById(announcementId);
    }

    @Test
    @DisplayName("delete() throws ResourceNotFoundException when announcement does not exist")
    void delete_notFound() {
        Long announcementId = 99L;
        when(announcementRepository.existsById(announcementId)).thenReturn(false);

        assertThatThrownBy(() -> announcementService.delete(announcementId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Annonce non trouvée");
    }
}
