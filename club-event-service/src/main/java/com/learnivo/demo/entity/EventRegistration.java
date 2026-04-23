package com.learnivo.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_registrations")
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;

    @Column(nullable = false)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    public EventRegistration() {
    }

    public EventRegistration(LocalDateTime registeredAt, String status, Event event, Student student) {
        this.registeredAt = registeredAt;
        this.status = status;
        this.event = event;
        this.student = student;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @JsonIgnore
    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    @JsonIgnore
    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    @JsonIgnore
    public Long getEventId() {
        return event != null ? event.getId() : null;
    }

    @JsonIgnore
    public Long getStudentId() {
        return student != null ? student.getId() : null;
    }

    @JsonIgnore
    public String getEventTitle() {
        return event != null ? event.getTitle() : null;
    }

    @JsonIgnore
    public String getStudentName() {
        return student != null ? student.getName() : null;
    }
}
