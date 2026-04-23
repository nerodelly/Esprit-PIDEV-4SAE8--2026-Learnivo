package com.learnivo.competitionservice.service;

import com.learnivo.competitionservice.dto.CompetitionRankingDTO;
import com.learnivo.competitionservice.dto.VoteStatsDTO;
import com.learnivo.competitionservice.entity.Competition;
import com.learnivo.competitionservice.entity.CompetitionVote;
import com.learnivo.competitionservice.exception.ResourceNotFoundException;
import com.learnivo.competitionservice.repository.CompetitionRepository;
import com.learnivo.competitionservice.repository.CompetitionVoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Transactional
public class VoteService {

    private final CompetitionVoteRepository voteRepository;
    private final CompetitionRepository competitionRepository;

    // ── Voter ou changer son vote ─────────────────────────────────────────────

    public VoteStatsDTO vote(Long competitionId, String email, String voteTypeStr) {
        Competition comp = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new ResourceNotFoundException("Competition non trouvée avec l'id: " + competitionId));

        // Seuls les participants inscrits peuvent voter
        boolean isRegistered = comp.getParticipants().stream()
                .anyMatch(p -> p.getEmail().equalsIgnoreCase(email));
        if (!isRegistered)
            throw new IllegalStateException("You must be registered for this competition to vote.");

        CompetitionVote.VoteType newType = CompetitionVote.VoteType.valueOf(voteTypeStr.toUpperCase());
        Optional<CompetitionVote> existing = voteRepository.findByCompetitionIdAndVoterEmail(competitionId, email);

        if (existing.isPresent()) {
            CompetitionVote vote = existing.get();
            if (vote.getVoteType() == newType) {
                // Même vote → on retire (toggle)
                voteRepository.delete(vote);
                return buildStats(competitionId, email);
            }
            // Vote différent → on met à jour
            vote.setVoteType(newType);
            voteRepository.save(vote);
        } else {
            CompetitionVote vote = CompetitionVote.builder()
                    .competitionId(competitionId)
                    .voterEmail(email)
                    .voteType(newType)
                    .build();
            voteRepository.save(vote);
        }

        return buildStats(competitionId, email);
    }

    // ── Récupérer les stats de votes ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public VoteStatsDTO getStats(Long competitionId, String email) {
        if (!competitionRepository.existsById(competitionId))
            throw new ResourceNotFoundException("Competition non trouvée avec l'id: " + competitionId);
        return buildStats(competitionId, email);
    }

    // ── Classement global des compétitions ────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CompetitionRankingDTO> getRanking() {
        List<Competition> competitions = competitionRepository.findAll();

        List<CompetitionRankingDTO> ranking = new ArrayList<>();
        for (Competition comp : competitions) {
            long likes    = voteRepository.countLikes(comp.getId());
            long dislikes = voteRepository.countDislikes(comp.getId());
            long score    = likes - dislikes;
            int participants = comp.getParticipants() != null ? comp.getParticipants().size() : 0;

            ranking.add(new CompetitionRankingDTO(
                    comp.getId(), comp.getTitle(), comp.getCategory(),
                    comp.getPrize(), comp.getImage(), comp.getSlug(),
                    comp.getStatus().name().toLowerCase(),
                    likes, dislikes, score, participants, 0
            ));
        }

        // Trier par score décroissant, puis par nombre de participants
        ranking.sort((a, b) -> {
            int cmp = Long.compare(b.getScore(), a.getScore());
            if (cmp != 0) return cmp;
            return Integer.compare(b.getParticipantCount(), a.getParticipantCount());
        });

        // Attribuer les rangs
        AtomicInteger rank = new AtomicInteger(1);
        ranking.forEach(r -> r.setRank(rank.getAndIncrement()));

        return ranking;
    }

    // ── Private helper ────────────────────────────────────────────────────────

    private VoteStatsDTO buildStats(Long competitionId, String email) {
        long likes    = voteRepository.countLikes(competitionId);
        long dislikes = voteRepository.countDislikes(competitionId);

        String userVote = null;
        if (email != null && !email.isBlank()) {
            Optional<CompetitionVote> userVoteOpt =
                    voteRepository.findByCompetitionIdAndVoterEmail(competitionId, email);
            userVote = userVoteOpt.map(v -> v.getVoteType().name()).orElse(null);
        }

        return new VoteStatsDTO(likes, dislikes, likes - dislikes, userVote);
    }
}
