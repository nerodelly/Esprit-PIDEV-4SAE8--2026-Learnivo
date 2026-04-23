package com.learnivo.classservice.service;

import com.learnivo.classservice.entity.AttendanceRecord;
import com.learnivo.classservice.entity.ClassMaterial;
import com.learnivo.classservice.entity.EnrolledStudent;
import com.learnivo.classservice.entity.PlatformClass;
import com.learnivo.classservice.exception.ResourceNotFoundException;
import com.learnivo.classservice.repository.ClassRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ClassService – Unit Tests")
class ClassServiceTest {

    @Mock
    private ClassRepository classRepository;

    @Mock
    private MeetingService meetingService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private ClassService classService;

    private PlatformClass sampleClass;

    @BeforeEach
    void setUp() {
        sampleClass = PlatformClass.builder()
                .id(1L)
                .title("Java Basics")
                .instructor("Prof. Smith")
                .day("Monday")
                .status(PlatformClass.Status.ACTIVE)
                .maxCapacity(2)
                .enrolled(new ArrayList<>())
                .attendance(new ArrayList<>())
                .materials(new ArrayList<>())
                .build();
    }

    // ── findAll ────────────────────────────────────────────────────────

    @Test
    @DisplayName("findAll() returns list from repository")
    void findAll_returnsList() {
        when(classRepository.findAll()).thenReturn(List.of(sampleClass));

        List<PlatformClass> result = classService.findAll();

        assertThat(result).hasSize(1).containsExactly(sampleClass);
        verify(classRepository).findAll();
    }

    // ── findById ────────────────────────────────────────────────────────

    @Test
    @DisplayName("findById() returns class when found")
    void findById_found() {
        when(classRepository.findById(1L)).thenReturn(Optional.of(sampleClass));

        PlatformClass result = classService.findById(1L);

        assertThat(result).isEqualTo(sampleClass);
    }

    @Test
    @DisplayName("findById() throws ResourceNotFoundException when not found")
    void findById_notFound() {
        when(classRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> classService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    // ── save ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("save() persists and returns the class")
    void save_happyPath() {
        when(classRepository.save(sampleClass)).thenReturn(sampleClass);

        PlatformClass result = classService.save(sampleClass);

        assertThat(result).isEqualTo(sampleClass);
        verify(classRepository).save(sampleClass);
    }

    // ── enroll ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("enroll() successfully adds a student")
    void enroll_success() {
        when(classRepository.findById(1L)).thenReturn(Optional.of(sampleClass));
        when(meetingService.generateMeetLink(any())).thenReturn("https://meet.google.com/abc");
        when(classRepository.save(any())).thenReturn(sampleClass);

        EnrolledStudent student = classService.enroll(1L, "Alice", "alice@example.com");

        assertThat(student.getName()).isEqualTo("Alice");
        assertThat(student.getEmail()).isEqualTo("alice@example.com");
        assertThat(sampleClass.getEnrolled()).hasSize(1);
        verify(emailService).sendEnrollmentConfirmation(any(), any(), any());
        verify(emailService).sendInstructorNotification(any(), any(), any());
    }

    @Test
    @DisplayName("enroll() sets status to FULL when max capacity is reached")
    void enroll_becomesFullWhenAtCapacity() {
        // capacity = 2, add first student so the second triggers FULL
        sampleClass.getEnrolled().add(
                EnrolledStudent.builder().name("Bob").email("bob@example.com").build());

        when(classRepository.findById(1L)).thenReturn(Optional.of(sampleClass));
        when(meetingService.generateMeetLink(any())).thenReturn("https://meet.google.com/abc");
        when(classRepository.save(any())).thenReturn(sampleClass);

        classService.enroll(1L, "Alice", "alice@example.com");

        assertThat(sampleClass.getStatus()).isEqualTo(PlatformClass.Status.FULL);
    }

    @Test
    @DisplayName("enroll() throws when class is CANCELLED")
    void enroll_throwsWhenCancelled() {
        sampleClass.setStatus(PlatformClass.Status.CANCELLED);
        when(classRepository.findById(1L)).thenReturn(Optional.of(sampleClass));

        assertThatThrownBy(() -> classService.enroll(1L, "Alice", "alice@example.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("cancelled");
    }

    @Test
    @DisplayName("enroll() throws when student is already enrolled")
    void enroll_throwsWhenAlreadyEnrolled() {
        sampleClass.getEnrolled().add(
                EnrolledStudent.builder().name("Alice").email("alice@example.com").build());
        when(classRepository.findById(1L)).thenReturn(Optional.of(sampleClass));

        assertThatThrownBy(() -> classService.enroll(1L, "Alice", "alice@example.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already enrolled");
    }

    @Test
    @DisplayName("enroll() throws when class is full (max capacity reached)")
    void enroll_throwsWhenFull() {
        // Fill up to capacity (2)
        sampleClass.getEnrolled().add(
                EnrolledStudent.builder().name("Bob").email("bob@example.com").build());
        sampleClass.getEnrolled().add(
                EnrolledStudent.builder().name("Carol").email("carol@example.com").build());
        when(classRepository.findById(1L)).thenReturn(Optional.of(sampleClass));

        assertThatThrownBy(() -> classService.enroll(1L, "Alice", "alice@example.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("full");
    }

    // ── delete ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("delete() clears all collections then deletes the class")
    void delete_clearsCollectionsAndDeletes() {
        sampleClass.getEnrolled().add(
                EnrolledStudent.builder().name("Alice").email("alice@example.com").build());
        sampleClass.getMaterials().add(
                ClassMaterial.builder().title("Slides").url("http://example.com").build());
        sampleClass.getAttendance().add(
                AttendanceRecord.builder().date("2025-01-01").attendees(List.of(1L)).build());

        when(classRepository.findById(1L)).thenReturn(Optional.of(sampleClass));

        classService.delete(1L);

        assertThat(sampleClass.getEnrolled()).isEmpty();
        assertThat(sampleClass.getMaterials()).isEmpty();
        assertThat(sampleClass.getAttendance()).isEmpty();
        verify(classRepository).deleteById(1L);
    }

    // ── markAttendance ──────────────────────────────────────────────────

    @Test
    @DisplayName("markAttendance() adds a new attendance record")
    void markAttendance_addsRecord() {
        when(classRepository.findById(1L)).thenReturn(Optional.of(sampleClass));
        when(classRepository.save(any())).thenReturn(sampleClass);

        classService.markAttendance(1L, "2025-06-01", List.of(1L, 2L));

        assertThat(sampleClass.getAttendance()).hasSize(1);
        assertThat(sampleClass.getAttendance().get(0).getDate()).isEqualTo("2025-06-01");
    }

    @Test
    @DisplayName("markAttendance() does not add duplicate records for same date")
    void markAttendance_noDuplicate() {
        sampleClass.getAttendance().add(
                AttendanceRecord.builder().date("2025-06-01").attendees(List.of(1L)).build());
        when(classRepository.findById(1L)).thenReturn(Optional.of(sampleClass));

        classService.markAttendance(1L, "2025-06-01", List.of(1L, 2L));

        assertThat(sampleClass.getAttendance()).hasSize(1);
        verify(classRepository, never()).save(any());
    }
}
