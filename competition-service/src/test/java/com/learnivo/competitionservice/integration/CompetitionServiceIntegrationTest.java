package com.learnivo.competitionservice.integration;

import com.learnivo.competitionservice.dto.RegisterDTO;
import com.learnivo.competitionservice.entity.Competition;
import com.learnivo.competitionservice.entity.Participant;
import com.learnivo.competitionservice.repository.CompetitionRepository;
import com.learnivo.competitionservice.service.CompetitionEmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DisplayName("CompetitionService – Integration Test")
class CompetitionServiceIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private CompetitionRepository competitionRepository;

    @MockBean
    private CompetitionEmailService emailService;

    private String getBaseUrl() {
        return "http://localhost:" + port + "/api/competitions";
    }

    @BeforeEach
    void setUp() {
        competitionRepository.deleteAll(); // Clean DB before each test
    }

    @Test
    @DisplayName("Full lifecycle: Create -> Get -> Register -> Delete")
    void fullLifecycleTest() {
        // --- 1. POST: Create a new competition ---
        Competition newComp = Competition.builder()
                .title("Global Hackathon 2026")
                // not setting slug here, service should auto-generate it
                .status(Competition.Status.UPCOMING)
                .maxParticipants(10)
                .participants(new ArrayList<>())
                .rounds(new ArrayList<>())
                .tags(new ArrayList<>())
                .build();

        ResponseEntity<Competition> createResponse = restTemplate.postForEntity(
                getBaseUrl(), newComp, Competition.class);

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        Competition createdComp = createResponse.getBody();
        assertThat(createdComp).isNotNull();
        assertThat(createdComp.getId()).isNotNull();
        assertThat(createdComp.getTitle()).isEqualTo("Global Hackathon 2026");
        // Verify the background logic assigned a slug
        assertThat(createdComp.getSlug()).isEqualTo("global-hackathon-2026");

        Long compId = createdComp.getId();

        // --- 2. GET: Verify it is in the list ---
        ResponseEntity<List<Competition>> getResponse = restTemplate.exchange(
                getBaseUrl(),
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<Competition>>() {}
        );
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody()).hasSize(1);
        assertThat(getResponse.getBody().get(0).getSlug()).isEqualTo("global-hackathon-2026");

        // --- 3. POST: Register a participant ---
        RegisterDTO registerDto = new RegisterDTO();
        registerDto.setName("Integration Participant");
        registerDto.setEmail("participant@test.com");

        ResponseEntity<Participant> registerResponse = restTemplate.postForEntity(
                getBaseUrl() + "/" + compId + "/register",
                registerDto,
                Participant.class
        );

        assertThat(registerResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        Participant participant = registerResponse.getBody();
        assertThat(participant).isNotNull();
        assertThat(participant.getName()).isEqualTo("Integration Participant");

        // --- 4. GET: Verify the participant is registered in the competition ---
        ResponseEntity<Competition> getSingleResponse = restTemplate.getForEntity(
                getBaseUrl() + "/" + compId, Competition.class);
        
        assertThat(getSingleResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        Competition fetchedComp = getSingleResponse.getBody();
        assertThat(fetchedComp).isNotNull();
        assertThat(fetchedComp.getParticipants()).hasSize(1);
        assertThat(fetchedComp.getParticipants().get(0).getEmail()).isEqualTo("participant@test.com");

        // --- 5. DELETE: Remove the competition ---
        restTemplate.delete(getBaseUrl() + "/" + compId);

        // --- 6. GET: Verify it's gone ---
        ResponseEntity<String> deletedResponse = restTemplate.getForEntity(
                getBaseUrl() + "/" + compId, String.class);
        assertThat(deletedResponse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
