package com.learnivo.competitionservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "competitions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Competition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String image;
    private String category;
    private String prize;
    private String startDate;   // ISO datetime ex: "2025-09-01T00:00:00"
    private String deadline;    // ISO datetime ex: "2025-10-15T23:59:00" → utilisé pour le countdown

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status = Status.UPCOMING;

    private Integer maxParticipants;

    @Column(columnDefinition = "TEXT")
    private String rules;

    private Boolean resultsPublished = false;

    @ElementCollection
    @CollectionTable(name = "competition_tags",
                     joinColumns = @JoinColumn(name = "competition_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "competition_id")
    @Builder.Default
    private List<Participant> participants = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "competition_id")
    @Builder.Default
    private List<CompetitionRound> rounds = new ArrayList<>();

    public enum Status { UPCOMING, ONGOING, COMPLETED; }
}
