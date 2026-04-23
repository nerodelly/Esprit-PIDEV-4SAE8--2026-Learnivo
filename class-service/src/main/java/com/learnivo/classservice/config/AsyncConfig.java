package com.learnivo.classservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {
    // Active @Async pour que les emails ne bloquent pas la réponse HTTP
}
