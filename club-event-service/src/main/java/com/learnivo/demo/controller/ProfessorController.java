package com.learnivo.demo.controller;

import com.learnivo.demo.dto.ProfessorRequest;
import com.learnivo.demo.dto.ProfessorResponse;
import com.learnivo.demo.entity.Professor;
import com.learnivo.demo.service.ProfessorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/professors")

public class ProfessorController {

    private final ProfessorService professorService;

    public ProfessorController(ProfessorService professorService) {
        this.professorService = professorService;
    }

    @GetMapping
    public ResponseEntity<List<ProfessorResponse>> getAll() {
        List<ProfessorResponse> list = professorService.findAll().stream()
                .map(ProfessorResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfessorResponse> getById(@PathVariable Long id) {
        Professor professor = professorService.findById(id);
        return ResponseEntity.ok(ProfessorResponse.from(professor));
    }

    @PostMapping
    public ResponseEntity<ProfessorResponse> create(@Valid @RequestBody ProfessorRequest request) {
        Professor professor = professorService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ProfessorResponse.from(professor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfessorResponse> update(@PathVariable Long id, @Valid @RequestBody ProfessorRequest request) {
        Professor professor = professorService.update(id, request);
        return ResponseEntity.ok(ProfessorResponse.from(professor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        professorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
