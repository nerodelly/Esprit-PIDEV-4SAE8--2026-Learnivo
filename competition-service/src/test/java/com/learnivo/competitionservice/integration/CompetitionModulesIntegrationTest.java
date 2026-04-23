package com.learnivo.competitionservice.integration;

import com.learnivo.competitionservice.dto.AnnouncementDTO;
import com.learnivo.competitionservice.dto.CompetitionRankingDTO;
import com.learnivo.competitionservice.dto.VoteDTO;
import com.learnivo.competitionservice.dto.VoteStatsDTO;
import com.learnivo.competitionservice.entity.Competition;
import com.learnivo.competitionservice.repository.AnnouncementRepository;
import com.learnivo.competitionservice.repository.CompetitionRepository;
import com.learnivo.competitionservice.repository.CompetitionVoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DisplayName("Competition Modules Integration Test")
class CompetitionModulesIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private CompetitionRepository competitionRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private CompetitionVoteRepository voteRepository;

    private String getBaseUrl() {
        return "http://localhost:" + port + "/api/competitions";
    }

    @BeforeEach
    void setUp() {
        voteRepository.deleteAll();
        announcementRepository.deleteAll();
        competitionRepository.deleteAll();
    }

    @Test
    @DisplayName("Complete Flow: Competition -> Announcement -> Vote -> Ranking")
    void completeFlowTest() {
        // 1. Create Competition
        Competition comp = Competition.builder()
                .title("Flow Competition")
                .status(Competition.Status.UPCOMING)
                .build();
        ResponseEntity<Competition> createResp = restTemplate.postForEntity(getBaseUrl(), comp, Competition.class);
        assertThat(createResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        Long compId = createResp.getBody().getId();

        // 2. Post Announcement
        AnnouncementDTO announcementDto = new AnnouncementDTO("Big News", "Start! ", "INFO");
        ResponseEntity<Object> postAnnResp = restTemplate.postForEntity(
                getBaseUrl() + "/" + compId + "/announcements",
                announcementDto, Object.class);
        assertThat(postAnnResp.getStatusCode()).isEqualTo(HttpStatus.OK);

        // 3. Verify Announcement exists
        ResponseEntity<List<Object>> getAnnResp = restTemplate.exchange(
                getBaseUrl() + "/" + compId + "/announcements",
                HttpMethod.GET, null, new ParameterizedTypeReference<List<Object>>() {});
        assertThat(getAnnResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getAnnResp.getBody()).hasSize(1);

        // 4. Register Participant (Vote requirement: must be registered)
        com.learnivo.competitionservice.dto.RegisterDTO registerDto = new com.learnivo.competitionservice.dto.RegisterDTO();
        registerDto.setName("Voter");
        registerDto.setEmail("voter@test.com");
        restTemplate.postForEntity(getBaseUrl() + "/" + compId + "/register", registerDto, Object.class);

        // 5. Vote LIKE
        VoteDTO voteDto = new VoteDTO();
        voteDto.setEmail("voter@test.com");
        voteDto.setVoteType("LIKE");
        ResponseEntity<VoteStatsDTO> voteResp = restTemplate.postForEntity(
                getBaseUrl() + "/" + compId + "/vote",
                voteDto, VoteStatsDTO.class);
        assertThat(voteResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(voteResp.getBody().getLikes()).isEqualTo(1);

        // 6. Check Ranking
        ResponseEntity<List<CompetitionRankingDTO>> rankingResp = restTemplate.exchange(
                getBaseUrl() + "/ranking",
                HttpMethod.GET, null, new ParameterizedTypeReference<List<CompetitionRankingDTO>>() {});
        assertThat(rankingResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(rankingResp.getBody()).isNotEmpty();
        assertThat(rankingResp.getBody().get(0).getTitle()).isEqualTo("Flow Competition");
        assertThat(rankingResp.getBody().get(0).getScore()).isEqualTo(1);

        // 6. Delete Competition
        restTemplate.delete(getBaseUrl() + "/" + compId);

        // 7. Verify Competition is gone
        ResponseEntity<Object> getCompResp = restTemplate.getForEntity(getBaseUrl() + "/" + compId, Object.class);
        assertThat(getCompResp.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
