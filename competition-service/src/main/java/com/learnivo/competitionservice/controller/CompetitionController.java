package com.learnivo.competitionservice.controller;

import com.learnivo.competitionservice.dto.RegisterDTO;
import com.learnivo.competitionservice.dto.SubmissionDTO;
import com.learnivo.competitionservice.entity.Competition;
import com.learnivo.competitionservice.entity.Participant;
import com.learnivo.competitionservice.service.CompetitionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/competitions")

@RequiredArgsConstructor
public class CompetitionController {

    private final CompetitionService competitionService;

    // ── CRUD ──────────────────────────────────────────────────────────

    @GetMapping
    public List<Competition> getAll() {
        return competitionService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Competition> getById(@PathVariable Long id) {
        return ResponseEntity.ok(competitionService.findById(id));
    }

    @GetMapping("/by-status/{status}")
    public List<Competition> getByStatus(@PathVariable String status) {
        return competitionService.findByStatus(status);
    }

    @PostMapping
    public ResponseEntity<Competition> create(@RequestBody Competition competition) {
        return ResponseEntity.ok(competitionService.save(competition));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Competition> update(@PathVariable Long id,
                                               @RequestBody Competition competition) {
        return ResponseEntity.ok(competitionService.update(id, competition));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        competitionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Inscription user public ────────────────────────────────────────

    @PostMapping("/{id}/register")
    public ResponseEntity<?> register(@PathVariable Long id,
                                       @Valid @RequestBody RegisterDTO dto) {
        try {
            Participant participant = competitionService.register(id, dto);
            return ResponseEntity.ok(participant);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Soumission de projet ────────────────────────────────────────────

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submit(@PathVariable Long id,
                                    @Valid @RequestBody SubmissionDTO dto) {
        try {
            Participant participant = competitionService.submit(
                    id, dto.getEmail(), dto.getSubmissionUrl(), dto.getSubmissionNotes(), dto.getScore(), dto.getErrorsCount());
            return ResponseEntity.ok(participant);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Recommandations ────────────────────────────────────────────────────────
    
    @GetMapping("/recommendations")
    public List<Competition> getRecommendations(@RequestParam String email) {
        return competitionService.getRecommendations(email);
    }
}
