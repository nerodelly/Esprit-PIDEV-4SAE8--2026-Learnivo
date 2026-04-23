package com.learnivo.demo.controller;

import com.learnivo.demo.service.CertificateService;
import com.lowagie.text.DocumentException;
import org.springframework.http.HttpHeaders;

import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Fonction métier avancée : délivrance de certificats PDF aux participants d'un événement.
 * GET /api/events/{eventId}/certificates/{studentId} → téléchargement du certificat.
 */
@RestController
@RequestMapping("/api/events")

public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @GetMapping("/{eventId}/certificates/{studentId}")
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable Long eventId,
            @PathVariable Long studentId) {
        try {
            byte[] pdf = certificateService.generateParticipationCertificate(eventId, studentId);
            String filename = "certificat-participation-" + eventId + "-" + studentId + ".pdf";
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(pdf);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (DocumentException | IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
