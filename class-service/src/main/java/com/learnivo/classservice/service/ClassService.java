package com.learnivo.classservice.service;

import com.learnivo.classservice.entity.AttendanceRecord;
import com.learnivo.classservice.entity.ClassMaterial;
import com.learnivo.classservice.entity.EnrolledStudent;
import com.learnivo.classservice.entity.PlatformClass;
import com.learnivo.classservice.exception.ResourceNotFoundException;
import com.learnivo.classservice.repository.ClassRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClassService {

    private final ClassRepository classRepository;
    private final MeetingService meetingService;
    private final EmailService emailService;

    // ── Lecture ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PlatformClass> findAll() {
        return classRepository.findAll();
    }

    @Transactional(readOnly = true)
    public PlatformClass findById(Long id) {
        return classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Classe non trouvée avec l'id: " + id));
    }

    @Transactional(readOnly = true)
    public List<PlatformClass> findByStatus(String status) {
        return classRepository.findByStatus(
                PlatformClass.Status.valueOf(status.toUpperCase()));
    }

    @Transactional(readOnly = true)
    public List<PlatformClass> findByDay(String day) {
        return classRepository.findByDay(day);
    }

    // ── Création ───────────────────────────────────────────────────────

    public PlatformClass save(PlatformClass cls) {
        return classRepository.save(cls);
    }

    // ── Mise à jour ────────────────────────────────────────────────────

    public PlatformClass update(Long id, PlatformClass updated) {
        PlatformClass existing = findById(id);

        existing.setTitle(updated.getTitle());
        existing.setInstructor(updated.getInstructor());
        existing.setDay(updated.getDay());
        existing.setTime(updated.getTime());
        existing.setDuration(updated.getDuration());
        existing.setLevel(updated.getLevel());
        existing.setType(updated.getType());
        existing.setLink(updated.getLink());
        existing.setStatus(updated.getStatus());
        existing.setMaxCapacity(updated.getMaxCapacity());
        existing.setRecurring(updated.isRecurring());
        existing.setNotes(updated.getNotes());

        existing.getEnrolled().clear();
        if (updated.getEnrolled() != null)
            existing.getEnrolled().addAll(updated.getEnrolled());

        existing.getAttendance().clear();
        if (updated.getAttendance() != null)
            existing.getAttendance().addAll(updated.getAttendance());

        existing.getMaterials().clear();
        if (updated.getMaterials() != null)
            existing.getMaterials().addAll(updated.getMaterials());

        return classRepository.save(existing);
    }

    // ── Suppression ────────────────────────────────────────────────────

    public void delete(Long id) {
        PlatformClass existing = findById(id);
        existing.getEnrolled().clear();
        existing.getAttendance().clear();
        existing.getMaterials().clear();
        classRepository.save(existing);
        classRepository.deleteById(id);
    }

    // ── Inscription élève ──────────────────────────────────────────────

    public EnrolledStudent enroll(Long classId, String name, String email) {
        PlatformClass cls = findById(classId);

        if (cls.getStatus() == PlatformClass.Status.CANCELLED)
            throw new IllegalStateException("This class has been cancelled.");

        boolean already = cls.getEnrolled().stream()
                .anyMatch(s -> s.getEmail().equalsIgnoreCase(email));
        if (already)
            throw new IllegalStateException("You are already enrolled in this class.");

        if (cls.getMaxCapacity() != null
                && cls.getEnrolled().size() >= cls.getMaxCapacity())
            throw new IllegalStateException("Sorry, this class is full.");

        // ★ Créer l'étudiant
        EnrolledStudent student = EnrolledStudent.builder()
                .name(name)
                .email(email)
                .enrolledAt(LocalDate.now().toString())
                .build();

        cls.getEnrolled().add(student);

        // Passer en FULL si capacité atteinte
        if (cls.getMaxCapacity() != null
                && cls.getEnrolled().size() >= cls.getMaxCapacity()) {
            cls.setStatus(PlatformClass.Status.FULL);
        }

        // ★ Générer le lien Meet (déterministe — même classe = même lien)
        String meetLink = meetingService.generateMeetLink(cls);

        // Stocker le lien dans la classe si pas encore fait
        if (cls.getLink() == null || cls.getLink().isBlank()) {
            cls.setLink(meetLink);
        }

        classRepository.save(cls);

        // ★ Envoyer les emails (async — ne bloque pas la réponse)
        emailService.sendEnrollmentConfirmation(student, cls, cls.getLink());
        emailService.sendInstructorNotification(student, cls, cls.getLink());

        return student;
    }

    // ── Matériaux ──────────────────────────────────────────────────────

    public PlatformClass addMaterial(Long classId, ClassMaterial material) {
        PlatformClass cls = findById(classId);
        cls.getMaterials().add(material);
        return classRepository.save(cls);
    }

    public PlatformClass removeMaterial(Long classId, Long materialId) {
        PlatformClass cls = findById(classId);
        cls.getMaterials().removeIf(m -> m.getId().equals(materialId));
        return classRepository.save(cls);
    }

    // ── Présences ──────────────────────────────────────────────────────

    public PlatformClass markAttendance(Long classId, String date, List<Long> attendeeIds) {
        PlatformClass cls = findById(classId);
        boolean exists = cls.getAttendance().stream().anyMatch(r -> r.getDate().equals(date));
        if (!exists) {
            AttendanceRecord record = AttendanceRecord.builder()
                    .date(date).attendees(attendeeIds).build();
            cls.getAttendance().add(record);
            classRepository.save(cls);
        }
        return cls;
    }
}
