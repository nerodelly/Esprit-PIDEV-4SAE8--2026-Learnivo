package com.learnivo.competitionservice.dto;

import lombok.Data;

@Data
public class VoteDTO {
    private String email;
    private String voteType; // "LIKE" ou "DISLIKE"
}
