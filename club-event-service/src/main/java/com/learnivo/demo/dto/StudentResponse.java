package com.learnivo.demo.dto;

/**
 * DTO pour éviter la sérialisation directe de l'entité Student (lazy loading, proxy).
 */
public record StudentResponse(
        Long id,
        String name,
        String email
) {
    public static StudentResponse from(com.learnivo.demo.entity.Student s) {
        if (s == null) return null;
        return new StudentResponse(
                s.getId(),
                s.getName(),
                s.getEmail()
        );
    }
}
