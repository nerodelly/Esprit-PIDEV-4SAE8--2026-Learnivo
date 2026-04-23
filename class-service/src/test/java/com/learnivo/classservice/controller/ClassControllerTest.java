package com.learnivo.classservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnivo.classservice.entity.PlatformClass;
import com.learnivo.classservice.exception.GlobalExceptionHandler;
import com.learnivo.classservice.exception.ResourceNotFoundException;
import com.learnivo.classservice.service.ClassService;
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

@WebMvcTest(ClassController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("ClassController – WebMvcTest")
class ClassControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ClassService classService;

    // ── GET /api/classes ─────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/classes returns 200 with list of classes")
    void getAll_returns200() throws Exception {
        PlatformClass cls = PlatformClass.builder()
                .id(1L).title("Java Basics").instructor("Smith")
                .status(PlatformClass.Status.ACTIVE)
                .enrolled(new ArrayList<>()).attendance(new ArrayList<>()).materials(new ArrayList<>())
                .build();
        when(classService.findAll()).thenReturn(List.of(cls));

        mockMvc.perform(get("/api/classes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Java Basics"))
                .andExpect(jsonPath("$[0].instructor").value("Smith"));
    }

    // ── GET /api/classes/{id} ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/classes/{id} returns 200 with the class")
    void getById_returns200() throws Exception {
        PlatformClass cls = PlatformClass.builder()
                .id(1L).title("Java Basics").instructor("Smith")
                .status(PlatformClass.Status.ACTIVE)
                .enrolled(new ArrayList<>()).attendance(new ArrayList<>()).materials(new ArrayList<>())
                .build();
        when(classService.findById(1L)).thenReturn(cls);

        mockMvc.perform(get("/api/classes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Java Basics"));
    }

    @Test
    @DisplayName("GET /api/classes/{id} returns 404 when not found")
    void getById_returns404() throws Exception {
        when(classService.findById(99L))
                .thenThrow(new ResourceNotFoundException("Classe non trouvée avec l'id: 99"));

        mockMvc.perform(get("/api/classes/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // ── POST /api/classes ─────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/classes returns 200 with the created class")
    void create_returns200() throws Exception {
        PlatformClass input = PlatformClass.builder()
                .title("Spring Boot")
                .instructor("Jones")
                .enrolled(new ArrayList<>()).attendance(new ArrayList<>()).materials(new ArrayList<>())
                .build();
        PlatformClass saved = PlatformClass.builder()
                .id(2L).title("Spring Boot").instructor("Jones")
                .status(PlatformClass.Status.ACTIVE)
                .enrolled(new ArrayList<>()).attendance(new ArrayList<>()).materials(new ArrayList<>())
                .build();
        when(classService.save(any())).thenReturn(saved);

        mockMvc.perform(post("/api/classes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.title").value("Spring Boot"));
    }

    // ── PUT /api/classes/{id} ─────────────────────────────────────────────

    @Test
    @DisplayName("PUT /api/classes/{id} returns 200 with the updated class")
    void update_returns200() throws Exception {
        PlatformClass updated = PlatformClass.builder()
                .id(1L).title("Updated Title").instructor("Smith")
                .status(PlatformClass.Status.ACTIVE)
                .enrolled(new ArrayList<>()).attendance(new ArrayList<>()).materials(new ArrayList<>())
                .build();
        when(classService.update(eq(1L), any())).thenReturn(updated);

        mockMvc.perform(put("/api/classes/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"));
    }

    // ── DELETE /api/classes/{id} ──────────────────────────────────────────

    @Test
    @DisplayName("DELETE /api/classes/{id} returns 204 no content")
    void delete_returns204() throws Exception {
        doNothing().when(classService).delete(1L);

        mockMvc.perform(delete("/api/classes/1"))
                .andExpect(status().isNoContent());

        verify(classService).delete(1L);
    }
}
