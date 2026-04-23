package org.example.imedbackend.controller;

import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.imedbackend.entity.InternshipEvaluation;
import org.example.imedbackend.service.InternshipEvaluationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internship-evaluations")

@RequiredArgsConstructor
public class InternshipEvaluationController {

    private final InternshipEvaluationService internshipEvaluationService;

    @GetMapping
    public List<InternshipEvaluation> getAll() {
        return internshipEvaluationService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternshipEvaluation> getById(@PathVariable Long id) {
        return ResponseEntity.of(internshipEvaluationService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Void> create(@Valid @RequestBody InternshipEvaluation internshipEvaluation) {
        try {
            internshipEvaluationService.create(internshipEvaluation);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id, @Valid @RequestBody InternshipEvaluation internshipEvaluation) {
        try {
            return internshipEvaluationService.update(id, internshipEvaluation)
                    .map(updatedEvaluation -> ResponseEntity.noContent().<Void>build())
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!internshipEvaluationService.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
