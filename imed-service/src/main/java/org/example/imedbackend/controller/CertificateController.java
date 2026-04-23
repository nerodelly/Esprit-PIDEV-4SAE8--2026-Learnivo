package org.example.imedbackend.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.imedbackend.dto.CertificateDto;
import org.example.imedbackend.service.CertificateService;
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
@RequestMapping("/api/certificates")

@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping
    public List<CertificateDto> getAll() {
        return certificateService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CertificateDto> getById(@PathVariable Long id) {
        return ResponseEntity.of(certificateService.getById(id));
    }

    @PostMapping
    public ResponseEntity<CertificateDto> create(@RequestBody CertificateDto certificateDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(certificateService.create(certificateDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CertificateDto> update(@PathVariable Long id, @RequestBody CertificateDto certificateDto) {
        return certificateService.update(id, certificateDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!certificateService.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
