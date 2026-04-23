package com.learnivo.competitionservice.scheduler;

import com.learnivo.competitionservice.entity.Competition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("CompetitionStatusScheduler – Unit Tests")
class CompetitionStatusSchedulerTest {

    private CompetitionStatusScheduler scheduler;
    private final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @BeforeEach
    void setUp() {
        // Le scheduler n'a pas de dépendance critique pour computeStatus — on le teste directement
        scheduler = new CompetitionStatusScheduler(null);
    }

    private Competition buildComp(Competition.Status status, String startDate, String deadline) {
        return Competition.builder()
                .id(1L).title("Test").status(status)
                .startDate(startDate).deadline(deadline)
                .participants(new java.util.ArrayList<>())
                .rounds(new java.util.ArrayList<>())
                .tags(new java.util.ArrayList<>())
                .build();
    }

    // ── deadline passée ────────────────────────────────────────────────────────

    @Test
    @DisplayName("UPCOMING → COMPLETED quand la deadline est passée")
    void upcoming_becomes_completed_when_deadline_past() {
        String pastDeadline = LocalDateTime.now().minusHours(1).format(FMT);
        Competition comp = buildComp(Competition.Status.UPCOMING, null, pastDeadline);

        Competition.Status result = scheduler.computeStatus(comp, LocalDateTime.now());

        assertThat(result).isEqualTo(Competition.Status.COMPLETED);
    }

    @Test
    @DisplayName("ONGOING → COMPLETED quand la deadline est passée")
    void ongoing_becomes_completed_when_deadline_past() {
        String pastDeadline = LocalDateTime.now().minusMinutes(30).format(FMT);
        Competition comp = buildComp(Competition.Status.ONGOING, null, pastDeadline);

        Competition.Status result = scheduler.computeStatus(comp, LocalDateTime.now());

        assertThat(result).isEqualTo(Competition.Status.COMPLETED);
    }

    @Test
    @DisplayName("COMPLETED ne change pas même si deadline passée")
    void completed_stays_completed() {
        String pastDeadline = LocalDateTime.now().minusDays(5).format(FMT);
        Competition comp = buildComp(Competition.Status.COMPLETED, null, pastDeadline);

        Competition.Status result = scheduler.computeStatus(comp, LocalDateTime.now());

        assertThat(result).isNull(); // aucun changement
    }

    // ── startDate ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("UPCOMING → ONGOING quand startDate passée et deadline future")
    void upcoming_becomes_ongoing_when_started() {
        String pastStart    = LocalDateTime.now().minusHours(2).format(FMT);
        String futureEnd    = LocalDateTime.now().plusDays(7).format(FMT);
        Competition comp = buildComp(Competition.Status.UPCOMING, pastStart, futureEnd);

        Competition.Status result = scheduler.computeStatus(comp, LocalDateTime.now());

        assertThat(result).isEqualTo(Competition.Status.ONGOING);
    }

    @Test
    @DisplayName("Aucun changement si startDate future et deadline future")
    void no_change_if_not_started_yet() {
        String futureStart = LocalDateTime.now().plusDays(2).format(FMT);
        String futureEnd   = LocalDateTime.now().plusDays(10).format(FMT);
        Competition comp = buildComp(Competition.Status.UPCOMING, futureStart, futureEnd);

        Competition.Status result = scheduler.computeStatus(comp, LocalDateTime.now());

        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Aucun changement si pas de deadline définie")
    void no_change_if_no_deadline() {
        Competition comp = buildComp(Competition.Status.UPCOMING, null, null);

        Competition.Status result = scheduler.computeStatus(comp, LocalDateTime.now());

        assertThat(result).isNull();
    }
}
