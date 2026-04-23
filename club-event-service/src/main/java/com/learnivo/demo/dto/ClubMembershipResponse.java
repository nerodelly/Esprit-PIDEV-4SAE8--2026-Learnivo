package com.learnivo.demo.dto;

import java.time.LocalDateTime;

/**
 * DTO pour éviter la sérialisation directe de l'entité ClubMembership (lazy loading, proxy).
 */
public record ClubMembershipResponse(
        Long id,
        LocalDateTime joinedAt,
        String status,
        Long clubId,
        Long studentId
) {
    public static ClubMembershipResponse from(com.learnivo.demo.entity.ClubMembership m) {
        if (m == null) return null;
        return new ClubMembershipResponse(
                m.getId(),
                m.getJoinedAt(),
                m.getStatus(),
                m.getClub() != null ? m.getClub().getId() : null,
                m.getStudent() != null ? m.getStudent().getId() : null
        );
    }
}
