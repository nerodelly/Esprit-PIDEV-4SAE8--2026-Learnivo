package com.learnivo.competitionservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnivo.competitionservice.dto.AnnouncementDTO;
import com.learnivo.competitionservice.entity.CompetitionAnnouncement;
import com.learnivo.competitionservice.exception.GlobalExceptionHandler;
import com.learnivo.competitionservice.exception.ResourceNotFoundException;
import com.learnivo.competitionservice.service.AnnouncementService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AnnouncementController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("AnnouncementController – WebMvcTest")
class AnnouncementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AnnouncementService announcementService;

    @Test
    @DisplayName("GET /{id}/announcements returns 200 with list")
    void getAnnouncements_success() throws Exception {
        CompetitionAnnouncement a = CompetitionAnnouncement.builder()
                .id(1L).title("Test Title").content("Test Content")
                .type(CompetitionAnnouncement.AnnouncementType.INFO).build();
        
        when(announcementService.getByCompetition(1L)).thenReturn(List.of(a));

        mockMvc.perform(get("/api/competitions/1/announcements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Title"))
                .andExpect(jsonPath("$[0].type").value("INFO"));
    }

    @Test
    @DisplayName("GET /{id}/announcements returns 404 when competition not found")
    void getAnnouncements_notFound() throws Exception {
        when(announcementService.getByCompetition(99L))
                .thenThrow(new ResourceNotFoundException("Competition non trouvée"));

        mockMvc.perform(get("/api/competitions/99/announcements"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("POST /{id}/announcements returns 200 with saved announcement")
    void post_success() throws Exception {
        AnnouncementDTO dto = new AnnouncementDTO("Title", "Content", "INFO");
        CompetitionAnnouncement saved = CompetitionAnnouncement.builder()
                .id(10L).title("Title").content("Content")
                .type(CompetitionAnnouncement.AnnouncementType.INFO).build();

        when(announcementService.post(eq(1L), any(AnnouncementDTO.class))).thenReturn(saved);

        mockMvc.perform(post("/api/competitions/1/announcements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.title").value("Title"));
    }

    @Test
    @DisplayName("DELETE /announcements/{id} returns 204")
    void delete_success() throws Exception {
        doNothing().when(announcementService).delete(5L);

        mockMvc.perform(delete("/api/competitions/announcements/5"))
                .andExpect(status().isNoContent());

        verify(announcementService).delete(5L);
    }
}
