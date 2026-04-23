package com.learnivo.demo.controller;

import com.learnivo.demo.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/communication")
@RequiredArgsConstructor
@Slf4j
public class CommunicationController {

    private final EmailService emailService;

    @GetMapping("/test-call")
    public ResponseEntity<Map<String, Object>> testCall() {
        log.info("Communication test-call endpoint accessed");
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Communication service is operational");
        response.put("service", "service-user");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-test-email")
    public ResponseEntity<Map<String, String>> sendTestEmail(@RequestParam String email) {
        try {
            emailService.sendEmail(
                    email,
                    "Learnivo - Test Email",
                    "This is a test email from Learnivo communication service."
            );
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Test email sent to " + email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to send test email", e);
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to send test email: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "service-user");
        response.put("module", "communication");
        return ResponseEntity.ok(response);
    }
}
