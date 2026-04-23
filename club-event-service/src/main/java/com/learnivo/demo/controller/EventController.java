package com.learnivo.demo.controller;

import com.learnivo.demo.dto.EventRequest;
import com.learnivo.demo.dto.EventResponse;
import com.learnivo.demo.dto.NextEventResponse;
import com.learnivo.demo.dto.PageResponse;
import com.learnivo.demo.entity.Event;
import com.learnivo.demo.service.EventService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")

public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    /** Liste simple (sans pagination) pour compatibilité. includeScheduled=true pour l'admin (voir événements en attente). */
    @GetMapping
    public ResponseEntity<?> getAllEvents(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTo,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir,
            @RequestParam(required = false, defaultValue = "false") boolean includeScheduled
    ) {
        boolean usePaged = page != null || size != null || title != null || status != null
                || location != null || startFrom != null || startTo != null || sortBy != null;
        if (usePaged) {
            int p = page != null ? page : 0;
            int s = size != null && size > 0 ? Math.min(size, 100) : 10;
            PageResponse<EventResponse> pr = eventService.findAllWithSearch(
                    title, status, location, startFrom, startTo, p, s, sortBy, sortDir, includeScheduled);
            return ResponseEntity.ok(pr);
        }
        List<EventResponse> list = eventService.findAll(includeScheduled).stream()
                .map(EventResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    /** Prochain événement à venir (pour le compte à rebours). includeScheduled=true pour l'admin. */
    @GetMapping("/next")
    public ResponseEntity<NextEventResponse> getNextUpcomingEvent(
            @RequestParam(required = false, defaultValue = "false") boolean includeScheduled) {
        return eventService.getNextUpcomingEvent(includeScheduled)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "false") boolean includeScheduled) {
        Event event = eventService.findById(id);
        if (!includeScheduled && event.getPublishAt() != null && event.getPublishAt().isAfter(java.time.LocalDateTime.now())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(EventResponse.from(event));
    }

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody EventRequest request) {
        Event event = eventService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(EventResponse.from(event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable Long id, @Valid @RequestBody EventRequest request) {
        Event event = eventService.update(id, request);
        return ResponseEntity.ok(EventResponse.from(event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** Vérifie si un événement est accessible à un étudiant. */
    @GetMapping("/{id}/accessible/{studentId}")
    public ResponseEntity<Boolean> isEventAccessible(
            @PathVariable Long id,
            @PathVariable Long studentId) {
        boolean accessible = eventService.isEventAccessibleToStudent(id, studentId);
        return ResponseEntity.ok(accessible);
    }

    /** Calcule le prix d'un événement pour un étudiant (réduction pour les membres). */
    @GetMapping("/{id}/price/{studentId}")
    public ResponseEntity<Double> getEventPrice(
            @PathVariable Long id,
            @PathVariable Long studentId) {
        double price = eventService.getEventPriceForStudent(id, studentId);
        return ResponseEntity.ok(price);
    }
}
