package com.learnivo.competitionservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnivo.competitionservice.dto.CompetitionRankingDTO;
import com.learnivo.competitionservice.dto.VoteDTO;
import com.learnivo.competitionservice.dto.VoteStatsDTO;
import com.learnivo.competitionservice.exception.GlobalExceptionHandler;
import com.learnivo.competitionservice.exception.ResourceNotFoundException;
import com.learnivo.competitionservice.service.VoteService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(VoteController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("VoteController – WebMvcTest")
class VoteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private VoteService voteService;

    @Test
    @DisplayName("POST /{id}/vote returns 200 with new stats")
    void vote_success() throws Exception {
        VoteDTO dto = new VoteDTO();
        dto.setEmail("user@test.com");
        dto.setVoteType("LIKE");

        VoteStatsDTO stats = new VoteStatsDTO(1, 0, 1, "LIKE");
        when(voteService.vote(eq(1L), eq("user@test.com"), eq("LIKE"))).thenReturn(stats);

        mockMvc.perform(post("/api/competitions/1/vote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.likes").value(1))
                .andExpect(jsonPath("$.userVote").value("LIKE"));
    }

    @Test
    @DisplayName("POST /{id}/vote returns 404 if competition not found")
    void vote_notFound() throws Exception {
        VoteDTO dto = new VoteDTO();
        dto.setEmail("user@test.com");
        dto.setVoteType("LIKE");

        when(voteService.vote(anyLong(), anyString(), anyString()))
                .thenThrow(new ResourceNotFoundException("Competition not found"));

        mockMvc.perform(post("/api/competitions/99/vote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("GET /{id}/votes returns 200 with stats")
    void getVotes_success() throws Exception {
        VoteStatsDTO stats = new VoteStatsDTO(10, 2, 8, null);
        when(voteService.getStats(1L, null)).thenReturn(stats);

        mockMvc.perform(get("/api/competitions/1/votes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.likes").value(10))
                .andExpect(jsonPath("$.score").value(8));
    }

    @Test
    @DisplayName("GET /ranking returns 200 with list")
    void getRanking_success() throws Exception {
        CompetitionRankingDTO r = new CompetitionRankingDTO(1L, "Comp", "Category", "Prize", "image.jpg", "slug", "UPCOMING", 10L, 2L, 8L, 5, 1);
        when(voteService.getRanking()).thenReturn(List.of(r));

        mockMvc.perform(get("/api/competitions/ranking"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Comp"))
                .andExpect(jsonPath("$[0].score").value(8));
    }
}
