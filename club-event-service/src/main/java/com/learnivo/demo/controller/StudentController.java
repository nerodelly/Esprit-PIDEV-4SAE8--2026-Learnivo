package com.learnivo.demo.controller;

import com.learnivo.demo.dto.StudentRequest;
import com.learnivo.demo.dto.StudentResponse;
import com.learnivo.demo.entity.Student;
import com.learnivo.demo.service.StudentService;
import com.learnivo.demo.service.UserServiceIntegration;
import com.learnivo.demo.dto.UserDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")

public class StudentController {

    private final StudentService studentService;
    private final UserServiceIntegration userServiceIntegration;

    public StudentController(StudentService studentService, UserServiceIntegration userServiceIntegration) {
        this.studentService = studentService;
        this.userServiceIntegration = userServiceIntegration;
    }

    @GetMapping("/fetch-remote-user-info/{id}")
    public ResponseEntity<UserDTO> fetchRemoteUserInfo(@PathVariable String id) {
        return userServiceIntegration.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-email")
    public ResponseEntity<StudentResponse> getByEmail(@RequestParam String email) {
        return studentService.findByEmail(email)
                .map(StudentResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/next-event")
    public ResponseEntity<com.learnivo.demo.dto.NextEventResponse> getNextEvent(@PathVariable Long id) {
        return studentService.getNextEvent(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<StudentResponse>> getAll() {
        List<StudentResponse> list = studentService.findAll().stream()
                .map(StudentResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getById(@PathVariable Long id) {
        Student student = studentService.findById(id);
        return ResponseEntity.ok(StudentResponse.from(student));
    }

    @PostMapping
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody StudentRequest request) {
        Student student = studentService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(StudentResponse.from(student));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> update(@PathVariable Long id, @Valid @RequestBody StudentRequest request) {
        Student student = studentService.update(id, request);
        return ResponseEntity.ok(StudentResponse.from(student));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
