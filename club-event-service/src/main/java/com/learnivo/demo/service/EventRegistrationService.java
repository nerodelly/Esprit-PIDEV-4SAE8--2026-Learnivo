package com.learnivo.demo.service;

import com.learnivo.demo.dto.EventRegistrationRequest;
import com.learnivo.demo.dto.EventRegistrationResponse;
import com.learnivo.demo.entity.Event;
import com.learnivo.demo.entity.EventRegistration;
import com.learnivo.demo.entity.Student;
import com.learnivo.demo.repository.EventRegistrationRepository;
import com.learnivo.demo.repository.EventRepository;
import com.learnivo.demo.repository.StudentRepository;
import com.learnivo.demo.repository.ClubMembershipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventRegistrationService {

    private final EventRegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final StudentRepository studentRepository;
    private final ClubMembershipRepository clubMembershipRepository;
    private final EventService eventService;

    public EventRegistrationService(EventRegistrationRepository registrationRepository,
                                    EventRepository eventRepository,
                                    StudentRepository studentRepository,
                                    ClubMembershipRepository clubMembershipRepository,
                                    EventService eventService) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.studentRepository = studentRepository;
        this.clubMembershipRepository = clubMembershipRepository;
        this.eventService = eventService;
    }

    public List<EventRegistration> findAll() {
        return registrationRepository.findAll();
    }

    public EventRegistration findById(Long id) {
        return registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event registration not found with id: " + id));
    }

    @Transactional
    public EventRegistrationResponse create(EventRegistrationRequest request) {
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + request.eventId()));
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + request.studentId()));

        // Vérification 1: Événement accessible à l'étudiant
        if (!eventService.isEventAccessibleToStudent(event.getId(), student.getId())) {
            throw new RuntimeException("Event not accessible to this student");
        }

        // Vérification 2: Événement n'est pas plein
        if (event.isFull()) {
            throw new RuntimeException("Event is full");
        }

        // Vérification 3: Événement n'a pas déjà commencé
        if (event.getStartTime().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Event has already started");
        }

        // Vérification 4: Étudiant n'est pas déjà inscrit
        boolean alreadyRegistered = registrationRepository.findByEventIdAndStudentId(event.getId(), student.getId()) != null;
        if (alreadyRegistered) {
            throw new RuntimeException("Student already registered for this event");
        }

        EventRegistration r = new EventRegistration();
        r.setRegisteredAt(request.registeredAt());
        r.setStatus(request.status());
        r.setEvent(event);
        r.setStudent(student);
        EventRegistration saved = registrationRepository.save(r);
        
        // Mise à jour du statut de membership si l'étudiant n'est pas déjà membre
        updateStudentMembershipStatus(event, student);
        
        return EventRegistrationResponse.from(saved);
    }

    @Transactional
    public EventRegistrationResponse update(Long id, EventRegistrationRequest request) {
        EventRegistration r = findById(id);
        r.setRegisteredAt(request.registeredAt());
        r.setStatus(request.status());
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + request.eventId()));
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + request.studentId()));
        r.setEvent(event);
        r.setStudent(student);
        EventRegistration saved = registrationRepository.save(r);
        return EventRegistrationResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<EventRegistrationResponse> findAllResponse() {
        return registrationRepository.findAll().stream()
                .map(EventRegistrationResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventRegistrationResponse> findByStudentId(Long studentId) {
        return registrationRepository.findByStudent_Id(studentId).stream()
                .map(EventRegistrationResponse::from)
                .collect(Collectors.toList());
    }

    /** Liste des participants d'un événement (pour délivrance de certificats). */
    @Transactional(readOnly = true)
    public List<EventRegistrationResponse> findByEventId(Long eventId) {
        return registrationRepository.findByEventIdWithStudent(eventId).stream()
                .map(EventRegistrationResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventRegistrationResponse findByIdResponse(Long id) {
        EventRegistration r = findById(id);
        return EventRegistrationResponse.from(r);
    }

    @Transactional
    public void delete(Long id) {
        EventRegistration r = findById(id);
        registrationRepository.delete(r);
    }

    /**
     * Met à jour le statut de membership de l'étudiant si nécessaire.
     * Si l'étudiant n'est pas membre du club de l'événement, il peut être invité à rejoindre.
     */
    private void updateStudentMembershipStatus(Event event, Student student) {
        if (event.getClub() != null) {
            boolean isMember = clubMembershipRepository.findByClubIdAndStudentId(event.getClub().getId(), student.getId()) != null;
            if (!isMember) {
                // Vous pouvez implémenter ici une logique pour inviter l'étudiant à rejoindre le club
                System.out.println("Student " + student.getName() + " registered for event from club " + 
                        event.getClub().getName() + " but is not a member.");
            }
        }
    }

    /**
     * Retourne le nombre de places disponibles pour un événement.
     */
    @Transactional(readOnly = true)
    public int getAvailablePlaces(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));
        if (event.getMaxParticipants() == null) {
            return Integer.MAX_VALUE;
        }
        int registeredCount = registrationRepository.findByEvent_Id(eventId).size();
        return event.getMaxParticipants() - registeredCount;
    }

    /**
     * Vérifie si un étudiant peut s'inscrire à un événement (vérifications complètes).
     */
    @Transactional(readOnly = true)
    public boolean canStudentRegister(Long eventId, Long studentId) {
        try {
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            if (!eventService.isEventAccessibleToStudent(event.getId(), student.getId())) {
                return false;
            }
            
            if (event.isFull()) {
                return false;
            }
            
            if (event.getStartTime().isBefore(java.time.LocalDateTime.now())) {
                return false;
            }
            
            return registrationRepository.findByEventIdAndStudentId(event.getId(), student.getId()) == null;
        } catch (Exception e) {
            return false;
        }
    }
}
