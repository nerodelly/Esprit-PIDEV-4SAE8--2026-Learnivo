package com.learnivo.competitionservice.controller;

import com.learnivo.competitionservice.dto.AnnouncementDTO;
import com.learnivo.competitionservice.entity.CompetitionAnnouncement;
import com.learnivo.competitionservice.exception.ResourceNotFoundException;
import com.learnivo.competitionservice.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/competitions")

@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    // GET /api/competitions/{id}/announcements
    @GetMapping("/{id}/announcements")
    public ResponseEntity<?> getAnnouncements(@PathVariable Long id) {
        try {
            List<CompetitionAnnouncement> list = announcementService.getByCompetition(id);
            return ResponseEntity.ok(list);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // POST /api/competitions/{id}/announcements  (admin only)
    @PostMapping("/{id}/announcements")
    public ResponseEntity<?> post(@PathVariable Long id,
                                   @RequestBody AnnouncementDTO dto) {
        try {
            CompetitionAnnouncement saved = announcementService.post(id, dto);
            return ResponseEntity.ok(saved);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /api/competitions/announcements/{id}  (admin only)
    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            announcementService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
