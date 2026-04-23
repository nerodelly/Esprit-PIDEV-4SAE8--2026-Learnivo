package org.example.imedbackend.controller;

import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.imedbackend.entity.InternshipOffer;
import org.example.imedbackend.service.InternshipOfferService;
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
@RequestMapping("/api/internship-offers")

@RequiredArgsConstructor
public class InternshipOfferController {

    private final InternshipOfferService internshipOfferService;

    @GetMapping
    public List<InternshipOffer> getAll() {
        return internshipOfferService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternshipOffer> getById(@PathVariable Long id) {
        return ResponseEntity.of(internshipOfferService.getById(id));
    }

    @PostMapping
    public ResponseEntity<InternshipOffer> create(@Valid @RequestBody InternshipOffer internshipOffer) {
        return ResponseEntity.status(HttpStatus.CREATED).body(internshipOfferService.create(internshipOffer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InternshipOffer> update(@PathVariable Long id, @Valid @RequestBody InternshipOffer internshipOffer) {
        return internshipOfferService.update(id, internshipOffer)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!internshipOfferService.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
