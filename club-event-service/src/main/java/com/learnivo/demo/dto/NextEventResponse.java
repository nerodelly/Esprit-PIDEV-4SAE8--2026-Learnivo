package com.learnivo.demo.dto;

import java.time.LocalDateTime;

/**
 * Prochain événement à venir pour un étudiant inscrit.
 */
public record NextEventResponse(
        Long eventId,
        String title,
        LocalDateTime startTime
) {}
