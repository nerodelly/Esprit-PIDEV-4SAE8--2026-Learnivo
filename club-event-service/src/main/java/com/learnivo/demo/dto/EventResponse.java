package com.learnivo.demo.dto;

import java.time.LocalDateTime;

/**
 * DTO pour éviter la sérialisation directe de l'entité Event (lazy loading, proxy).
 */
public record EventResponse(
        Long id,
        String title,
        String description,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String location,
        String status,
        LocalDateTime createdAt,
        Long clubId,
        String clubName,
        Double price,
        Integer maxParticipants,
        Integer registeredParticipants,
        LocalDateTime publishAt
) {
    public static EventResponse from(com.learnivo.demo.entity.Event e) {
        if (e == null) return null;
        String clubName = e.getClub() != null ? e.getClub().getName() : null;
        Long clubId = e.getClub() != null ? e.getClub().getId() : null;
        int registeredParticipants = e.getRegistrations() != null ? e.getRegistrations().size() : 0;
        return new EventResponse(
                e.getId(),
                e.getTitle(),
                e.getDescription(),
                e.getStartTime(),
                e.getEndTime(),
                e.getLocation(),
                e.getStatus(),
                e.getCreatedAt(),
                clubId,
                clubName,
                e.getPrice(),
                e.getMaxParticipants(),
                registeredParticipants,
                e.getPublishAt()
        );
    }
}
