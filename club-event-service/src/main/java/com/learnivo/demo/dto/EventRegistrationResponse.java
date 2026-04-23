package com.learnivo.demo.dto;

import java.time.LocalDateTime;

/**
 * DTO pour éviter la sérialisation directe de l'entité EventRegistration (lazy loading, proxy).
 */
public record EventRegistrationResponse(
        Long id,
        java.time.LocalDateTime registeredAt,
        String status,
        Long eventId,
        Long studentId,
        String studentName,
        String eventTitle,
        java.time.LocalDateTime eventStartTime
) {
    public static EventRegistrationResponse from(com.learnivo.demo.entity.EventRegistration r) {
        if (r == null) return null;
        var event = r.getEvent();
        var student = r.getStudent();
        return new EventRegistrationResponse(
                r.getId(),
                r.getRegisteredAt(),
                r.getStatus(),
                event != null ? event.getId() : null,
                student != null ? student.getId() : null,
                student != null ? student.getName() : null,
                event != null ? event.getTitle() : null,
                event != null ? event.getStartTime() : null
        );
    }
}
