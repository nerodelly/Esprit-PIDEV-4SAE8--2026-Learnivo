package org.example.imedbackend.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.imedbackend.entity.InternshipApplication;
import org.example.imedbackend.service.InternshipApplicationService;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/internship-applications")

@RequiredArgsConstructor
public class InternshipApplicationController {

    private final InternshipApplicationService internshipApplicationService;

    @GetMapping
    public List<InternshipApplication> getAll() {
        return internshipApplicationService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternshipApplication> getById(@PathVariable Long id) {
        return ResponseEntity.of(internshipApplicationService.getById(id));
    }

    @PostMapping
    public ResponseEntity<InternshipApplication> create(@Valid @RequestBody InternshipApplication internshipApplication) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(internshipApplicationService.create(internshipApplication));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping(value = "/upload-cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadCv(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Fichier vide"));
        }
        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        boolean isPdf = contentType.equals("application/pdf") || originalName.endsWith(".pdf");
        if (!isPdf) {
            return ResponseEntity.badRequest().body(Map.of("error", "Seuls les fichiers PDF sont autorisés"));
        }
        if (file.getSize() > 20 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "La taille maximale autorisée est 20MB"));
        }
        try {
            Path uploadDir = Paths.get("uploads", "internship-cv").toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);
            String safeName = (file.getOriginalFilename() == null ? "cv.pdf" : file.getOriginalFilename()).replaceAll("[^a-zA-Z0-9._-]", "_");
            String fileName = UUID.randomUUID() + "-" + safeName;
            Path target = uploadDir.resolve(fileName);
            file.transferTo(target.toFile());
            String fileUrl = "http://localhost:8080/uploads/internship-cv/" + fileName;
            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Erreur lors de l'upload du PDF"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<InternshipApplication> update(@PathVariable Long id, @Valid @RequestBody InternshipApplication internshipApplication) {
        try {
            return internshipApplicationService.update(id, internshipApplication)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!internshipApplicationService.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
