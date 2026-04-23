package com.learnivo.demo.dto;

/**
 * DTO pour éviter la sérialisation directe de l'entité Club (lazy loading, proxy).
 */
public record ClubResponse(
        Long id,
        String name,
        String description,
        String status
) {
    public static ClubResponse from(com.learnivo.demo.entity.Club c) {
        if (c == null) return null;
        return new ClubResponse(
                c.getId(),
                c.getName(),
                c.getDescription(),
                c.getStatus()
        );
    }
}
