package org.example.imedbackend.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.imedbackend.dto.CertificationRuleDto;
import org.example.imedbackend.service.CertificationRuleService;
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
@RequestMapping("/api/certification-rules")

@RequiredArgsConstructor
public class CertificationRuleController {

    private final CertificationRuleService certificationRuleService;

    @GetMapping
    public List<CertificationRuleDto> getAll() {
        return certificationRuleService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CertificationRuleDto> getById(@PathVariable Long id) {
        return ResponseEntity.of(certificationRuleService.getById(id));
    }

    @PostMapping
    public ResponseEntity<CertificationRuleDto> create(@RequestBody CertificationRuleDto certificationRuleDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(certificationRuleService.create(certificationRuleDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CertificationRuleDto> update(@PathVariable Long id, @RequestBody CertificationRuleDto certificationRuleDto) {
        return certificationRuleService.update(id, certificationRuleDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!certificationRuleService.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
