package com.learnivo.demo.controller;

import com.learnivo.demo.dto.EventRequest;
import com.learnivo.demo.dto.EventResponse;
import com.learnivo.demo.service.ClubEventManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs/{clubId}/events")

public class ClubEventManagementController {

    private final ClubEventManagementService clubEventManagementService;

    public ClubEventManagementController(ClubEventManagementService clubEventManagementService) {
        this.clubEventManagementService = clubEventManagementService;
    }

    /** Crée un événement pour un club. */
    @PostMapping
    public ResponseEntity<EventResponse> createClubEvent(
            @PathVariable Long clubId,
            @Valid @RequestBody EventRequest request) {
        EventResponse response = clubEventManagementService.createClubEvent(clubId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Récupère tous les événements d'un club. */
    @GetMapping
    public ResponseEntity<List<EventResponse>> getClubEvents(@PathVariable Long clubId) {
        List<EventResponse> events = clubEventManagementService.getClubEvents(clubId);
        return ResponseEntity.ok(events);
    }

    /** Inscrit automatiquement tous les membres du club à un événement. */
    @PostMapping("/{eventId}/auto-register")
    public ResponseEntity<Integer> autoRegisterClubMembers(
            @PathVariable Long clubId,
            @PathVariable Long eventId) {
        int registeredCount = clubEventManagementService.autoRegisterClubMembers(clubId, eventId);
        return ResponseEntity.ok(registeredCount);
    }

    /** Récupère les statistiques des événements pour un club. */
    @GetMapping("/statistics")
    public ResponseEntity<ClubEventManagementService.ClubEventStatistics> getClubEventStatistics(
            @PathVariable Long clubId) {
        ClubEventManagementService.ClubEventStatistics statistics = 
                clubEventManagementService.getClubEventStatistics(clubId);
        return ResponseEntity.ok(statistics);
    }

    /** Annule un événement et désinscrit tous les participants. */
    @DeleteMapping("/{eventId}/cancel")
    public ResponseEntity<Void> cancelClubEvent(
            @PathVariable Long clubId,
            @PathVariable Long eventId) {
        clubEventManagementService.cancelClubEvent(eventId);
        return ResponseEntity.noContent().build();
    }

    /** Récupère les événements disponibles pour un étudiant. */
    @GetMapping("/available/{studentId}")
    public ResponseEntity<List<EventResponse>> getAvailableEventsForStudent(
            @PathVariable Long clubId,
            @PathVariable Long studentId) {
        List<EventResponse> events = clubEventManagementService.getAvailableEventsForStudent(studentId);
        return ResponseEntity.ok(events);
    }
}
