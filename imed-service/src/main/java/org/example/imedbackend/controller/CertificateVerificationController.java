package org.example.imedbackend.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.imedbackend.dto.CertificateVerificationDto;
import org.example.imedbackend.service.CertificateVerificationService;
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
@RequestMapping("/api/certificate-verifications")

@RequiredArgsConstructor
public class CertificateVerificationController {

    private final CertificateVerificationService certificateVerificationService;

    @GetMapping
    public List<CertificateVerificationDto> getAll() {
        return certificateVerificationService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CertificateVerificationDto> getById(@PathVariable Long id) {
        return ResponseEntity.of(certificateVerificationService.getById(id));
    }

    @PostMapping
    public ResponseEntity<CertificateVerificationDto> create(@RequestBody CertificateVerificationDto certificateVerificationDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(certificateVerificationService.create(certificateVerificationDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CertificateVerificationDto> update(@PathVariable Long id, @RequestBody CertificateVerificationDto certificateVerificationDto) {
        return certificateVerificationService.update(id, certificateVerificationDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!certificateVerificationService.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
