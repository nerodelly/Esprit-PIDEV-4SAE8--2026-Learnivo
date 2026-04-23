package com.learnivo.demo.service;

import com.learnivo.demo.entity.Event;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Appel à l'API YouremailAPI (https://youremailapi.com) pour envoyer un email
 * à chaque création d'événement (destinataire : youremailapi.to, ex. timoudi69@gmail.com).
 * Aucun compte ni connexion requis.
 */
@Service
public class YouremailApiService {

    private static final Logger log = LoggerFactory.getLogger(YouremailApiService.class);

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${youremailapi.url:https://api.youremailapi.com/mailer/}")
    private String apiUrl;

    @Value("${youremailapi.apikey:}")
    private String apikey;

    @Value("${youremailapi.smtp_account:}")
    private String smtpAccount;

    @Value("${youremailapi.template:}")
    private String templateToken;

    @Value("${youremailapi.to:timoudi69@gmail.com}")
    private String recipientEmail;

    /**
     * Envoie une notification par email à chaque création d'événement.
     * Destinataire : youremailapi.to (application.properties).
     * Ne fait rien si l'API n'est pas configurée.
     */
    public void sendEventCreatedNotification(Event event) {
        if (apikey == null || apikey.isBlank() || smtpAccount == null || smtpAccount.isBlank()
                || templateToken == null || templateToken.isBlank()) {
            log.warn("YouremailAPI non configuré (apikey, smtp_account ou template manquant). Email non envoyé.");
            return;
        }
        String to = recipientEmail != null && !recipientEmail.isBlank() ? recipientEmail : "timoudi69@gmail.com";
        try {
            String subject = "Nouvel événement créé : " + (event.getTitle() != null ? event.getTitle() : "");
            Map<String, String> variables = new HashMap<>();
            variables.put("%TITLE%", event.getTitle() != null ? event.getTitle() : "");
            variables.put("%DESCRIPTION%", event.getDescription() != null ? event.getDescription() : "");
            variables.put("%START%", event.getStartTime() != null ? event.getStartTime().toString() : "");
            variables.put("%LOCATION%", event.getLocation() != null ? event.getLocation() : "");
            Map<String, Object> body = new HashMap<>();
            body.put("subject", subject);
            body.put("to", to);
            body.put("smtp_account", smtpAccount);
            body.put("template", templateToken);
            body.put("variables", variables);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", apikey);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, request, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Notification YouremailAPI envoyée pour l'événement id={} -> {}", event.getId(), to);
            } else {
                log.warn("YouremailAPI a répondu {} pour l'événement id={}. Corps: {}", response.getStatusCode(), event.getId(), response.getBody());
            }
        } catch (Exception e) {
            log.error("Erreur lors de l'appel YouremailAPI pour l'événement id={}: {}", event.getId(), e.getMessage(), e);
        }
    }
}
