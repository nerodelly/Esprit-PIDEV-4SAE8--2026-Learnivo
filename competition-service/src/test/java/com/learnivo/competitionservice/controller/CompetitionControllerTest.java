package com.learnivo.competitionservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnivo.competitionservice.entity.Competition;
import com.learnivo.competitionservice.exception.GlobalExceptionHandler;
import com.learnivo.competitionservice.exception.ResourceNotFoundException;
import com.learnivo.competitionservice.service.CompetitionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CompetitionController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("CompetitionController – WebMvcTest")
class CompetitionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CompetitionService competitionService;

    // ── GET /api/competitions ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/competitions returns 200 with list of competitions")
    void getAll_returns200() throws Exception {
        Competition comp = Competition.builder()
                .id(1L).title("Math Olympiad").slug("math-olympiad")
                .status(Competition.Status.UPCOMING)
                .participants(new ArrayList<>()).rounds(new ArrayList<>()).tags(new ArrayList<>())
                .build();
        when(competitionService.findAll()).thenReturn(List.of(comp));

        mockMvc.perform(get("/api/competitions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Math Olympiad"))
                .andExpect(jsonPath("$[0].slug").value("math-olympiad"));
    }

    // ── GET /api/competitions/{id} ────────────────────────────────────────

    @Test
    @DisplayName("GET /api/competitions/{id} returns 200 with the competition")
    void getById_returns200() throws Exception {
        Competition comp = Competition.builder()
                .id(1L).title("Math Olympiad").slug("math-olympiad")
                .status(Competition.Status.UPCOMING)
                .participants(new ArrayList<>()).rounds(new ArrayList<>()).tags(new ArrayList<>())
                .build();
        when(competitionService.findById(1L)).thenReturn(comp);

        mockMvc.perform(get("/api/competitions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Math Olympiad"));
    }

    @Test
    @DisplayName("GET /api/competitions/{id} returns 404 when not found")
    void getById_returns404() throws Exception {
        when(competitionService.findById(99L))
                .thenThrow(new ResourceNotFoundException("Competition non trouvée avec l'id: 99"));

        mockMvc.perform(get("/api/competitions/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // ── POST /api/competitions ────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/competitions returns 200 with the created competition")
    void create_returns200() throws Exception {
        Competition input = Competition.builder()
                .title("Coding Challenge")
                .participants(new ArrayList<>()).rounds(new ArrayList<>()).tags(new ArrayList<>())
                .build();
        Competition saved = Competition.builder()
                .id(2L).title("Coding Challenge").slug("coding-challenge")
                .status(Competition.Status.UPCOMING)
                .participants(new ArrayList<>()).rounds(new ArrayList<>()).tags(new ArrayList<>())
                .build();
        when(competitionService.save(any())).thenReturn(saved);

        mockMvc.perform(post("/api/competitions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.slug").value("coding-challenge"));
    }

    // ── PUT /api/competitions/{id} ────────────────────────────────────────

    @Test
    @DisplayName("PUT /api/competitions/{id} returns 200 with the updated competition")
    void update_returns200() throws Exception {
        Competition updated = Competition.builder()
                .id(1L).title("Updated Title").slug("updated-title")
                .status(Competition.Status.ONGOING)
                .participants(new ArrayList<>()).rounds(new ArrayList<>()).tags(new ArrayList<>())
                .build();
        when(competitionService.update(eq(1L), any())).thenReturn(updated);

        mockMvc.perform(put("/api/competitions/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.status").value("ONGOING"));
    }

    // ── DELETE /api/competitions/{id} ─────────────────────────────────────

    @Test
    @DisplayName("DELETE /api/competitions/{id} returns 204 no content")
    void delete_returns204() throws Exception {
        doNothing().when(competitionService).delete(1L);

        mockMvc.perform(delete("/api/competitions/1"))
                .andExpect(status().isNoContent());

        verify(competitionService).delete(1L);
    }
}
