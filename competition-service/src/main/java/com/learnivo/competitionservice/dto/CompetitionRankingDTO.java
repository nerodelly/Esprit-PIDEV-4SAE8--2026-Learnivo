package com.learnivo.competitionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CompetitionRankingDTO {
    private Long competitionId;
    private String title;
    private String category;
    private String prize;
    private String image;
    private String slug;
    private String status;
    private long likes;
    private long dislikes;
    private long score;        // likes - dislikes
    private int participantCount;
    private int rank;
}
