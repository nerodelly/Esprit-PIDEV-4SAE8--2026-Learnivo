package com.learnivo.demo.controller;

import com.learnivo.demo.dto.EventRegistrationRequest;
import com.learnivo.demo.dto.EventRegistrationResponse;
import com.learnivo.demo.service.EventRegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event-registrations")

public class EventRegistrationController {

    private final EventRegistrationService registrationService;

    public EventRegistrationController(EventRegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @GetMapping
    public ResponseEntity<List<EventRegistrationResponse>> getAll(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long eventId) {
        if (eventId != null) {
            return ResponseEntity.ok(registrationService.findByEventId(eventId));
        }
        if (studentId != null) {
            return ResponseEntity.ok(registrationService.findByStudentId(studentId));
        }
        return ResponseEntity.ok(registrationService.findAllResponse());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventRegistrationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(registrationService.findByIdResponse(id));
    }

    @PostMapping
    public ResponseEntity<EventRegistrationResponse> create(@Valid @RequestBody EventRegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(registrationService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventRegistrationResponse> update(@PathVariable Long id, @Valid @RequestBody EventRegistrationRequest request) {
        return ResponseEntity.ok(registrationService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        registrationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** Retourne le nombre de places disponibles pour un événement. */
    @GetMapping("/available-places/{eventId}")
    public ResponseEntity<Integer> getAvailablePlaces(@PathVariable Long eventId) {
        int available = registrationService.getAvailablePlaces(eventId);
        return ResponseEntity.ok(available);
    }

    /** Vérifie si un étudiant peut s'inscrire à un événement. */
    @GetMapping("/can-register/{eventId}/{studentId}")
    public ResponseEntity<Boolean> canStudentRegister(
            @PathVariable Long eventId,
            @PathVariable Long studentId) {
        boolean canRegister = registrationService.canStudentRegister(eventId, studentId);
        return ResponseEntity.ok(canRegister);
    }
}
