package com.learnivo.competitionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VoteStatsDTO {
    private long likes;
    private long dislikes;
    private long score;       // likes - dislikes
    private String userVote;  // "LIKE", "DISLIKE", ou null
}
