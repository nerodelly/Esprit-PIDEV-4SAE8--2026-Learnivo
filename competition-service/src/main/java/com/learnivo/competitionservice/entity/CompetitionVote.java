package com.learnivo.competitionservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "competition_votes",
       uniqueConstraints = @UniqueConstraint(
               name = "uk_vote_comp_email",
               columnNames = {"competition_id", "voter_email"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompetitionVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "competition_id")
    private Long competitionId;

    @Column(name = "voter_email")
    private String voterEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "vote_type", length = 10)
    private VoteType voteType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public enum VoteType { LIKE, DISLIKE }
}
