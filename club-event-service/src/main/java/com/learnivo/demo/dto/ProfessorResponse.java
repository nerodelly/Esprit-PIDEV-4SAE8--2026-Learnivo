package com.learnivo.demo.dto;

/**
 * DTO pour éviter la sérialisation directe de l'entité Professor (lazy loading, proxy).
 */
public record ProfessorResponse(
        Long id,
        String name,
        String email
) {
    public static ProfessorResponse from(com.learnivo.demo.entity.Professor p) {
        if (p == null) return null;
        return new ProfessorResponse(
                p.getId(),
                p.getName(),
                p.getEmail()
        );
    }
}
