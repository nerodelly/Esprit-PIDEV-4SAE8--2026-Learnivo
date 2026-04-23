package com.learnivo.classservice.integration;

import com.learnivo.classservice.dto.EnrollDTO;
import com.learnivo.classservice.entity.EnrolledStudent;
import com.learnivo.classservice.entity.PlatformClass;
import com.learnivo.classservice.repository.ClassRepository;
import com.learnivo.classservice.service.EmailService;
import com.learnivo.classservice.service.MeetingService;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DisplayName("ClassService – Integration Test")
class ClassServiceIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ClassRepository classRepository;

    // We mock external services so we don't send real emails or hit Google Meet APIs
    @MockBean
    private EmailService emailService;

    @MockBean
    private MeetingService meetingService;

    private String getBaseUrl() {
        return "http://localhost:" + port + "/api/classes";
    }

    @BeforeEach
    void setUp() {
        classRepository.deleteAll(); // Clean DB before each test
    }

    @Test
    @DisplayName("Full lifecycle: Create -> Get -> Enroll -> Delete")
    void fullLifecycleTest() {
        // --- 1. POST: Create a new class ---
        PlatformClass newClass = PlatformClass.builder()
                .title("Integration Testing Masterclass")
                .instructor("Jane Doe")
                .day("Wednesday")
                .status(PlatformClass.Status.ACTIVE)
                .maxCapacity(5)
                .enrolled(new ArrayList<>())
                .attendance(new ArrayList<>())
                .materials(new ArrayList<>())
                .build();

        ResponseEntity<PlatformClass> createResponse = restTemplate.postForEntity(
                getBaseUrl(), newClass, PlatformClass.class);

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        PlatformClass createdClass = createResponse.getBody();
        assertThat(createdClass).isNotNull();
        assertThat(createdClass.getId()).isNotNull();
        assertThat(createdClass.getTitle()).isEqualTo("Integration Testing Masterclass");

        Long classId = createdClass.getId();

        // --- 2. GET: Verify it is in the list ---
        ResponseEntity<List<PlatformClass>> getResponse = restTemplate.exchange(
                getBaseUrl(),
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<PlatformClass>>() {}
        );
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody()).hasSize(1);
        assertThat(getResponse.getBody().get(0).getTitle()).isEqualTo("Integration Testing Masterclass");

        // --- 3. POST: Enroll a student ---
        when(meetingService.generateMeetLink(any())).thenReturn("https://meet.google.com/test-link");
        
        EnrollDTO enrollDto = new EnrollDTO();
        enrollDto.setName("Integration Student");
        enrollDto.setEmail("student@test.com");

        ResponseEntity<EnrolledStudent> enrollResponse = restTemplate.postForEntity(
                getBaseUrl() + "/" + classId + "/enroll",
                enrollDto,
                EnrolledStudent.class
        );

        assertThat(enrollResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        EnrolledStudent student = enrollResponse.getBody();
        assertThat(student).isNotNull();
        assertThat(student.getName()).isEqualTo("Integration Student");

        // --- 4. GET: Verify the student is enrolled in the class ---
        ResponseEntity<PlatformClass> getSingleResponse = restTemplate.getForEntity(
                getBaseUrl() + "/" + classId, PlatformClass.class);
        
        assertThat(getSingleResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        PlatformClass fetchedClass = getSingleResponse.getBody();
        assertThat(fetchedClass).isNotNull();
        assertThat(fetchedClass.getEnrolled()).hasSize(1);
        assertThat(fetchedClass.getEnrolled().get(0).getEmail()).isEqualTo("student@test.com");
        assertThat(fetchedClass.getLink()).isEqualTo("https://meet.google.com/test-link");

        // --- 5. DELETE: Remove the class ---
        restTemplate.delete(getBaseUrl() + "/" + classId);

        // --- 6. GET: Verify it's gone ---
        ResponseEntity<String> deletedResponse = restTemplate.getForEntity(
                getBaseUrl() + "/" + classId, String.class);
        assertThat(deletedResponse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
