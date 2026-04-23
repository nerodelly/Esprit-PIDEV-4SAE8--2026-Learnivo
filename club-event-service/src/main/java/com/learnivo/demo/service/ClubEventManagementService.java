package com.learnivo.demo.service;

import com.learnivo.demo.dto.EventRequest;
import com.learnivo.demo.dto.EventResponse;
import com.learnivo.demo.dto.EventRegistrationRequest;
import com.learnivo.demo.entity.Club;
import com.learnivo.demo.entity.Event;
import com.learnivo.demo.entity.EventRegistration;
import com.learnivo.demo.entity.Student;
import com.learnivo.demo.repository.ClubRepository;
import com.learnivo.demo.repository.EventRepository;
import com.learnivo.demo.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClubEventManagementService {

    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final StudentRepository studentRepository;
    private final EventService eventService;
    private final EventRegistrationService eventRegistrationService;

    public ClubEventManagementService(ClubRepository clubRepository,
                                      EventRepository eventRepository,
                                      StudentRepository studentRepository,
                                      EventService eventService,
                                      EventRegistrationService eventRegistrationService) {
        this.clubRepository = clubRepository;
        this.eventRepository = eventRepository;
        this.studentRepository = studentRepository;
        this.eventService = eventService;
        this.eventRegistrationService = eventRegistrationService;
    }

    /**
     * Crée un événement pour un club.
     * - Vérifie que le club existe
     * - Définit le club par défaut pour l'événement
     * - Vérifie les dates valides
     */
    @Transactional
    public EventResponse createClubEvent(Long clubId, EventRequest request) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        if (request.startTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Event cannot start in the past");
        }

        if (request.endTime().isBefore(request.startTime())) {
            throw new RuntimeException("Event end time must be after start time");
        }

        EventRequest clubEventRequest = new EventRequest(
                request.title(),
                request.description(),
                request.startTime(),
                request.endTime(),
                request.location(),
                request.status(),
                club.getName(),
                request.maxParticipants(),
                request.publishAt()
        );

        Event event = eventService.create(clubEventRequest);
        return EventResponse.from(event);
    }

    /**
     * Récupère tous les événements d'un club avec pagination.
     */
    @Transactional(readOnly = true)
    public List<EventResponse> getClubEvents(Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        return club.getEvents().stream()
                .map(EventResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Insère automatiquement tous les membres du club dans un événement.
     * Utile pour les événements exclusifs aux membres.
     */
    @Transactional
    public int autoRegisterClubMembers(Long clubId, Long eventId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));

        if (event.getClub() == null || !event.getClub().getId().equals(clubId)) {
            throw new RuntimeException("Event does not belong to this club");
        }

        int registeredCount = 0;
        for (var membership : club.getMemberships()) {
            if ("ACTIVE".equals(membership.getStatus()) && 
                eventRegistrationService.canStudentRegister(eventId, membership.getStudent().getId())) {
                try {
                    eventRegistrationService.create(new EventRegistrationRequest(
                            LocalDateTime.now(),
                            "REGISTERED",
                            event.getId(),
                            membership.getStudent().getId()
                    ));
                    registeredCount++;
                } catch (Exception e) {
                    // Ignore students who can't be registered (already registered, etc.)
                }
            }
        }

        return registeredCount;
    }

    /**
     * Calcule les statistiques des événements pour un club.
     */
    @Transactional(readOnly = true)
    public ClubEventStatistics getClubEventStatistics(Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        int totalEvents = club.getEvents().size();
        int activeEvents = (int) club.getEvents().stream()
                .filter(event -> event.getStatus().equals("UPCOMING") && 
                                event.getStartTime().isAfter(LocalDateTime.now()))
                .count();
        
        int totalRegistrations = club.getEvents().stream()
                .mapToInt(event -> event.getRegistrations().size())
                .sum();
        
        double averageRegistrations = totalEvents > 0 ? (double) totalRegistrations / totalEvents : 0;

        return new ClubEventStatistics(totalEvents, activeEvents, totalRegistrations, averageRegistrations);
    }

    /**
     * Supprime un événement et désinscrit tous les participants.
     */
    @Transactional
    public void cancelClubEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));

        // Désinscrire tous les participants
        List<EventRegistration> registrations = event.getRegistrations();
        for (EventRegistration registration : registrations) {
            eventRegistrationService.delete(registration.getId());
        }

        eventService.delete(eventId);
    }

    /**
     * Récupère les événements disponibles pour un étudiant.
     * - Événements publics
     * - Événements des clubs dont l'étudiant est membre
     */
    @Transactional(readOnly = true)
    public List<EventResponse> getAvailableEventsForStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        // Événements publics (non associés à un club)
        List<Event> publicEvents = eventRepository.findAll().stream()
                .filter(event -> event.getClub() == null)
                .collect(Collectors.toList());

        // Événements des clubs dont l'étudiant est membre
        List<Event> clubEvents = student.getClubMemberships().stream()
                .filter(membership -> "ACTIVE".equals(membership.getStatus()))
                .map(membership -> membership.getClub().getEvents())
                .flatMap(List::stream)
                .collect(Collectors.toList());

        // Fusionner et éliminer les doublons
        List<Event> allEvents = publicEvents.stream()
                .filter(event -> event.getStartTime().isAfter(LocalDateTime.now()))
                .collect(Collectors.toList());
        
        clubEvents.stream()
                .filter(event -> event.getStartTime().isAfter(LocalDateTime.now()))
                .forEach(event -> {
                    if (!allEvents.stream().anyMatch(e -> e.getId().equals(event.getId()))) {
                        allEvents.add(event);
                    }
                });

        return allEvents.stream()
                .map(EventResponse::from)
                .sorted((e1, e2) -> e1.startTime().compareTo(e2.startTime()))
                .collect(Collectors.toList());
    }

    /**
     * Classe interne pour les statistiques des événements de club.
     */
    public record ClubEventStatistics(
            int totalEvents,
            int activeEvents,
            int totalRegistrations,
            double averageRegistrations
    ) {}
}
