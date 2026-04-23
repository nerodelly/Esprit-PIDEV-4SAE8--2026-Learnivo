package com.learnivo.competitionservice.controller;

import com.learnivo.competitionservice.dto.CompetitionRankingDTO;
import com.learnivo.competitionservice.dto.VoteDTO;
import com.learnivo.competitionservice.dto.VoteStatsDTO;
import com.learnivo.competitionservice.exception.ResourceNotFoundException;
import com.learnivo.competitionservice.service.VoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/competitions")

@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;

    /**
     * POST /api/competitions/{id}/vote
     * Body: { "email": "user@example.com", "voteType": "LIKE" }
     * Toggle: si le même vote existe déjà, il est retiré.
     */
    @PostMapping("/{id}/vote")
    public ResponseEntity<?> vote(@PathVariable Long id, @RequestBody VoteDTO dto) {
        try {
            VoteStatsDTO stats = voteService.vote(id, dto.getEmail(), dto.getVoteType());
            return ResponseEntity.ok(stats);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Competition not found in database. Please create it via the backend first."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "voteType must be LIKE or DISLIKE"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/competitions/{id}/votes?email=user@example.com
     * Retourne les stats (likes, dislikes, score, vote de l'utilisateur).
     */
    @GetMapping("/{id}/votes")
    public ResponseEntity<VoteStatsDTO> getVotes(
            @PathVariable Long id,
            @RequestParam(required = false) String email) {
        return ResponseEntity.ok(voteService.getStats(id, email));
    }

    /**
     * GET /api/competitions/ranking
     * Retourne le classement global des compétitions par popularité (likes - dislikes).
     */
    @GetMapping("/ranking")
    public ResponseEntity<List<CompetitionRankingDTO>> getRanking() {
        return ResponseEntity.ok(voteService.getRanking());
    }
}
