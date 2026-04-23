package com.learnivo.competitionservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String motivation;

    private String registeredAt;
    private Integer score;

    @Builder.Default
    private Integer errorsCount = 0;

    @Column(columnDefinition = "TEXT")
    private String submissionUrl;

    @Column(columnDefinition = "TEXT")
    private String submissionNotes;

    private String submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private Status status = Status.REGISTERED;

    public enum Status {
        REGISTERED, WINNER, DISQUALIFIED;
    }
}
