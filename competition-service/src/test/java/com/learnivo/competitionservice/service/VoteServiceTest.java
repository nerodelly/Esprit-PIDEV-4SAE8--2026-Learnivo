package com.learnivo.competitionservice.service;

import com.learnivo.competitionservice.dto.VoteStatsDTO;
import com.learnivo.competitionservice.entity.Competition;
import com.learnivo.competitionservice.entity.CompetitionVote;
import com.learnivo.competitionservice.entity.Participant;
import com.learnivo.competitionservice.repository.CompetitionRepository;
import com.learnivo.competitionservice.repository.CompetitionVoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("VoteService – Unit Tests")
class VoteServiceTest {

    @Mock private CompetitionVoteRepository voteRepository;
    @Mock private CompetitionRepository competitionRepository;

    @InjectMocks
    private VoteService voteService;
    private Competition sampleCompetition;

    @BeforeEach
    void setUp() {
        sampleCompetition = Competition.builder()
                .id(1L)
                .participants(new ArrayList<>())
                .build();
        
        sampleCompetition.getParticipants().add(
                Participant.builder().email("alice@test.com").build()
        );

        lenient().when(competitionRepository.existsById(1L)).thenReturn(true);
        lenient().when(competitionRepository.findById(1L)).thenReturn(Optional.of(sampleCompetition));
    }

    // ── vote() ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Premier vote LIKE : crée un nouveau vote")
    void vote_like_creates_new() {
        when(voteRepository.findByCompetitionIdAndVoterEmail(1L, "alice@test.com"))
                .thenReturn(Optional.empty());
        when(voteRepository.countLikes(1L)).thenReturn(1L);
        when(voteRepository.countDislikes(1L)).thenReturn(0L);
        when(voteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        VoteStatsDTO stats = voteService.vote(1L, "alice@test.com", "LIKE");

        assertThat(stats.getLikes()).isEqualTo(1);
        assertThat(stats.getDislikes()).isEqualTo(0);
        verify(voteRepository).save(any(CompetitionVote.class));
    }

    @Test
    @DisplayName("Toggle : même vote supprime le vote existant")
    void vote_same_type_toggles_off() {
        CompetitionVote existing = CompetitionVote.builder()
                .id(1L).competitionId(1L).voterEmail("alice@test.com")
                .voteType(CompetitionVote.VoteType.LIKE).build();

        when(voteRepository.findByCompetitionIdAndVoterEmail(1L, "alice@test.com"))
                .thenReturn(Optional.of(existing));
        when(voteRepository.countLikes(1L)).thenReturn(0L);
        when(voteRepository.countDislikes(1L)).thenReturn(0L);

        VoteStatsDTO stats = voteService.vote(1L, "alice@test.com", "LIKE");

        verify(voteRepository).delete(existing);
        assertThat(stats.getLikes()).isEqualTo(0);
    }

    @Test
    @DisplayName("Changer LIKE → DISLIKE met à jour le vote existant")
    void vote_different_type_updates_existing() {
        CompetitionVote existing = CompetitionVote.builder()
                .id(1L).competitionId(1L).voterEmail("alice@test.com")
                .voteType(CompetitionVote.VoteType.LIKE).build();

        when(voteRepository.findByCompetitionIdAndVoterEmail(1L, "alice@test.com"))
                .thenReturn(Optional.of(existing));
        when(voteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(voteRepository.countLikes(1L)).thenReturn(0L);
        when(voteRepository.countDislikes(1L)).thenReturn(1L);

        voteService.vote(1L, "alice@test.com", "DISLIKE");

        assertThat(existing.getVoteType()).isEqualTo(CompetitionVote.VoteType.DISLIKE);
        verify(voteRepository).save(existing);
    }

    @Test
    @DisplayName("voteType invalide lève IllegalArgumentException")
    void vote_invalid_type_throws() {
        assertThatThrownBy(() -> voteService.vote(1L, "alice@test.com", "INVALID"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
