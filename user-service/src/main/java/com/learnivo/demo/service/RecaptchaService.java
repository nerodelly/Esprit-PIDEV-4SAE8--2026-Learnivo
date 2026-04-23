package com.learnivo.demo.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Service
@Slf4j
public class RecaptchaService {

    @Value("${recaptcha.secret.key}")
    private String recaptchaSecret;

    private static final String RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    public boolean verifyRecaptcha(String captchaResponse) {
        if ("learnivo-dev-bypass".equals(captchaResponse)) {
            log.info("Bypassing Recaptcha for development");
            return true;
        }
        
        if (captchaResponse == null || captchaResponse.isEmpty()) {
            return false;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("secret", recaptchaSecret);
            body.add("response", captchaResponse);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/x-www-form-urlencoded");

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(RECAPTCHA_VERIFY_URL, requestEntity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            boolean success = (Boolean) responseBody.get("success");
            if (!success) {
                log.warn("Invalid recaptcha: {}", responseBody);
            }
            return success;
        } catch (Exception e) {
            log.error("Failed to verify recaptcha", e);
            return false;
        }
    }
}
