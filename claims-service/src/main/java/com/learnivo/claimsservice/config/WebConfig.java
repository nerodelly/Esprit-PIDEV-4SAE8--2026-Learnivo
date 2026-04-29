package com.learnivo.claimsservice.config;

import org.springframework.context.annotation.Configuration;

/**
 * CORS is handled entirely by the API Gateway (globalcors + DedupeResponseHeader).
 * Do NOT add CORS mappings here — duplicate headers cause browsers to reject responses.
 */
@Configuration
public class WebConfig {
    // intentionally empty
}
