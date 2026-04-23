package com.learnivo.demo.service;

import com.learnivo.demo.dto.NextEventResponse;
import com.learnivo.demo.dto.StudentRequest;
import com.learnivo.demo.entity.Event;
import com.learnivo.demo.entity.EventRegistration;
import com.learnivo.demo.entity.Student;
import com.learnivo.demo.repository.EventRegistrationRepository;
import com.learnivo.demo.repository.StudentRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final EventRegistrationRepository eventRegistrationRepository;

    public StudentService(StudentRepository studentRepository,
                         EventRegistrationRepository eventRegistrationRepository) {
        this.studentRepository = studentRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
    }

    public List<Student> findAll() {
        return studentRepository.findAll();
    }

    public Student findById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
    }

    public Optional<Student> findByEmail(String email) {
        if (email == null || email.isBlank()) return Optional.empty();
        return studentRepository.findByEmailIgnoreCase(email.trim());
    }

    @Transactional(readOnly = true)
    public Optional<NextEventResponse> getNextEvent(Long studentId) {
        List<EventRegistration> list = eventRegistrationRepository.findUpcomingByStudentId(studentId, PageRequest.of(0, 1));
        if (list.isEmpty()) return Optional.empty();
        Event event = list.get(0).getEvent();
        return Optional.of(new NextEventResponse(event.getId(), event.getTitle(), event.getStartTime()));
    }

    public Student create(StudentRequest request) {
        if (request.email() != null && !request.email().isBlank()
                && findByEmail(request.email().trim()).isPresent()) {
            throw new RuntimeException("Cet email est déjà utilisé.");
        }
        Student student = new Student();
        student.setName(request.name());
        student.setEmail(request.email());
        student.setUserId(System.currentTimeMillis()); // auto-generate if not provided
        return studentRepository.save(student);
    }

    public Student update(Long id, StudentRequest request) {
        Student student = findById(id);
        student.setName(request.name());
        student.setEmail(request.email());
        return studentRepository.save(student);
    }

    @Transactional
    public void delete(Long id) {
        Student student = findById(id);
        student.getClubMemberships().size();
        student.getEventRegistrations().size();
        studentRepository.delete(student);
    }
}
