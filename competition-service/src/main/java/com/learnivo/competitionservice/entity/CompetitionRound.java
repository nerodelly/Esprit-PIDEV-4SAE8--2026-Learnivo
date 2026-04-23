package com.learnivo.competitionservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "competition_rounds")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompetitionRound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String startDate;
    private String endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status = Status.PENDING;

    public enum Status { PENDING, ACTIVE, DONE }
}
