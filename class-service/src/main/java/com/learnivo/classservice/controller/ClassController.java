package com.learnivo.classservice.controller;

import com.learnivo.classservice.dto.EnrollDTO;
import com.learnivo.classservice.entity.ClassMaterial;
import com.learnivo.classservice.entity.EnrolledStudent;
import com.learnivo.classservice.entity.PlatformClass;
import com.learnivo.classservice.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classes")

@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;

    // ── CRUD ──────────────────────────────────────────────────────────

    @GetMapping
    public List<PlatformClass> getAll() {
        return classService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlatformClass> getById(@PathVariable Long id) {
        return ResponseEntity.ok(classService.findById(id));
    }

    @GetMapping("/by-day/{day}")
    public List<PlatformClass> getByDay(@PathVariable String day) {
        return classService.findByDay(day);
    }

    @GetMapping("/by-status/{status}")
    public List<PlatformClass> getByStatus(@PathVariable String status) {
        return classService.findByStatus(status);
    }

    @PostMapping
    public ResponseEntity<PlatformClass> create(@RequestBody PlatformClass cls) {
        return ResponseEntity.ok(classService.save(cls));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlatformClass> update(@PathVariable Long id,
                                                 @RequestBody PlatformClass cls) {
        return ResponseEntity.ok(classService.update(id, cls));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Inscription user public ────────────────────────────────────────

    @PostMapping("/{id}/enroll")
    public ResponseEntity<?> enroll(@PathVariable Long id,
                                     @RequestBody EnrollDTO dto) {
        try {
            EnrolledStudent student = classService.enroll(id, dto.getName(), dto.getEmail());
            return ResponseEntity.ok(student);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Présences ─────────────────────────────────────────────────────

    @PostMapping("/{id}/attendance")
    public ResponseEntity<PlatformClass> markAttendance(
            @PathVariable Long id,
            @RequestParam String date,
            @RequestBody List<Long> attendeeIds) {
        return ResponseEntity.ok(classService.markAttendance(id, date, attendeeIds));
    }

    // ── Matériaux ─────────────────────────────────────────────────────

    @PostMapping("/{id}/materials")
    public ResponseEntity<PlatformClass> addMaterial(@PathVariable Long id,
                                                      @RequestBody ClassMaterial material) {
        return ResponseEntity.ok(classService.addMaterial(id, material));
    }

    @DeleteMapping("/{id}/materials/{materialId}")
    public ResponseEntity<PlatformClass> removeMaterial(@PathVariable Long id,
                                                         @PathVariable Long materialId) {
        return ResponseEntity.ok(classService.removeMaterial(id, materialId));
    }
}
