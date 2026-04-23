package com.learnivo.demo.service;

import com.learnivo.demo.dto.EventRequest;
import com.learnivo.demo.dto.EventResponse;
import com.learnivo.demo.dto.NextEventResponse;
import com.learnivo.demo.dto.PageResponse;
import com.learnivo.demo.entity.Event;
import com.learnivo.demo.entity.Club;
import com.learnivo.demo.repository.EventRepository;
import com.learnivo.demo.repository.ClubRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final YouremailApiService youremailApiService;
    private final ClubRepository clubRepository;

    public EventService(EventRepository eventRepository, YouremailApiService youremailApiService,
                        ClubRepository clubRepository) {
        this.eventRepository = eventRepository;
        this.youremailApiService = youremailApiService;
        this.clubRepository = clubRepository;
    }

    /**
     * Liste tous les événements. Si includeScheduled est false, ne retourne que les événements
     * déjà publiés (publishAt null ou <= now).
     */
    public List<Event> findAll(boolean includeScheduled) {
        List<Event> all = eventRepository.findAll();
        if (includeScheduled) return all;
        LocalDateTime now = LocalDateTime.now();
        return all.stream()
                .filter(e -> e.getPublishAt() == null || !e.getPublishAt().isAfter(now))
                .collect(Collectors.toList());
    }

    /**
     * Recherche avancée avec pagination.
     * @param title filtre sur le titre (contains, ignore case)
     * @param status filtre sur le statut (exact)
     * @param location filtre sur la localisation (contains, ignore case)
     * @param startFrom date/heure de début min (ISO)
     * @param startTo date/heure de début max (ISO)
     * @param page numéro de page (0-based)
     * @param size nombre d'éléments par page
     * @param sortBy champ de tri (ex: startTime, title)
     * @param sortDir direction (asc, desc)
     */
    @Transactional(readOnly = true)
    public PageResponse<EventResponse> findAllWithSearch(
            String title,
            String status,
            String location,
            LocalDateTime startFrom,
            LocalDateTime startTo,
            int page,
            int size,
            String sortBy,
            String sortDir,
            boolean includeScheduled
    ) {
        Specification<Event> spec = buildSearchSpecification(title, status, location, startFrom, startTo, includeScheduled);
        Sort sort = sortBy != null && !sortBy.isBlank()
                ? ("desc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending())
                : Sort.by("startTime").ascending();
        int safeSize = Math.min(Math.max(size <= 0 ? 10 : size, 1), 100);
        Pageable pageable = PageRequest.of(Math.max(0, page), safeSize, sort);
        Page<Event> result = spec == null ? eventRepository.findAll(pageable) : eventRepository.findAll(spec, pageable);
        List<EventResponse> content = result.getContent().stream().map(EventResponse::from).collect(Collectors.toList());
        return new PageResponse<>(
                content,
                result.getTotalElements(),
                result.getTotalPages(),
                result.getNumber(),
                result.getSize(),
                result.isFirst(),
                result.isLast()
        );
    }

    private Specification<Event> buildSearchSpecification(
            String title,
            String status,
            String location,
            LocalDateTime startFrom,
            LocalDateTime startTo,
            boolean includeScheduled
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (title != null && !title.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + title.trim().toLowerCase() + "%"));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status.trim()));
            }
            if (location != null && !location.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.trim().toLowerCase() + "%"));
            }
            if (startFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startTime"), startFrom));
            }
            if (startTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("startTime"), startTo));
            }
            if (!includeScheduled) {
                LocalDateTime now = LocalDateTime.now();
                predicates.add(cb.or(
                        cb.isNull(root.get("publishAt")),
                        cb.lessThanOrEqualTo(root.get("publishAt"), now)
                ));
            }
            return predicates.isEmpty() ? null : cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public Event findById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
    }

    /**
     * Retourne le prochain événement à venir (startTime > now) pour le compte à rebours.
     * Tous les événements sont considérés (y compris non publiés) pour que le chrono affiche toujours le prochain.
     */
    @Transactional(readOnly = true)
    public java.util.Optional<NextEventResponse> getNextUpcomingEvent(boolean includeScheduled) {
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findAll().stream()
                .filter(e -> e.getStartTime() != null && e.getStartTime().isAfter(now))
                .min(java.util.Comparator.comparing(Event::getStartTime))
                .map(e -> new NextEventResponse(e.getId(), e.getTitle(), e.getStartTime()));
    }

    public Event create(EventRequest request) {
        Event event = new Event();
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setLocation(request.location());
        event.setStatus(request.status());
        event.setMaxParticipants(request.maxParticipants());
        event.setPublishAt(request.publishAt());
        
        if (request.clubName() != null && !request.clubName().isBlank()) {
            Club club = clubRepository.findByNameIgnoreCase(request.clubName().trim())
                    .orElseThrow(() -> new RuntimeException("Club not found with name: " + request.clubName()));
            event.setClub(club);
        } else {
            event.setClub(null);
        }
        
        event = eventRepository.save(event);
        youremailApiService.sendEventCreatedNotification(event);
        return event;
    }

    public Event update(Long id, EventRequest request) {
        Event event = findById(id);
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setLocation(request.location());
        event.setStatus(request.status());
        event.setMaxParticipants(request.maxParticipants());
        event.setPublishAt(request.publishAt());
        
        if (request.clubName() != null && !request.clubName().isBlank()) {
            Club club = clubRepository.findByNameIgnoreCase(request.clubName().trim())
                    .orElseThrow(() -> new RuntimeException("Club not found with name: " + request.clubName()));
            event.setClub(club);
        } else {
            event.setClub(null);
        }
        
        return eventRepository.save(event);
    }

    @Transactional
    public void delete(Long id) {
        Event event = findById(id);
        event.getRegistrations().size();
        eventRepository.delete(event);
    }

    /**
     * Vérifie si un événement est accessible à un étudiant (membres du club ont accès prioritaire).
     */
    @Transactional(readOnly = true)
    public boolean isEventAccessibleToStudent(Long eventId, Long studentId) {
        Event event = findById(eventId);
        
        // Si l'événement n'est pas associé à un club, il est accessible à tous
        if (event.getClub() == null) {
            return true;
        }
        
        // Vérifie si l'étudiant est membre du club associé à l'événement
        return event.getClub().getMemberships().stream()
                .anyMatch(membership -> membership.getStudent().getId().equals(studentId) && 
                        "ACTIVE".equals(membership.getStatus()));
    }

    /**
     * Calcule le prix d'un événement pour un étudiant (membres du club bénéficient de réductions).
     */
    @Transactional(readOnly = true)
    public double getEventPriceForStudent(Long eventId, Long studentId) {
        Event event = findById(eventId);
        
        // Si l'événement est gratuit
        if (event.getPrice() == null || event.getPrice() == 0) {
            return 0;
        }
        
        // Si l'événement n'est pas associé à un club, prix normal
        if (event.getClub() == null) {
            return event.getPrice();
        }
        
        // Vérifie si l'étudiant est membre du club (réduction de 20% pour les membres)
        boolean isMember = event.getClub().getMemberships().stream()
                .anyMatch(membership -> membership.getStudent().getId().equals(studentId) && 
                        "ACTIVE".equals(membership.getStatus()));
        
        return isMember ? event.getPrice() * 0.8 : event.getPrice();
    }
}
