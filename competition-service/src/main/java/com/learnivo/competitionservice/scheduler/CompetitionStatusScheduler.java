package com.learnivo.competitionservice.scheduler;

import com.learnivo.competitionservice.entity.Competition;
import com.learnivo.competitionservice.repository.CompetitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

/**
 * Runs every 30 seconds to transition competition statuses automatically:
 *   UPCOMING → ONGOING   when now >= startDate
 *   ONGOING  → COMPLETED when now >= deadline
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CompetitionStatusScheduler {

    private final CompetitionRepository competitionRepository;

    @Scheduled(fixedRate = 30_000) // every 30 seconds
    public void updateStatuses() {
        LocalDateTime now = LocalDateTime.now();
        List<Competition> all = competitionRepository.findAll();

        for (Competition c : all) {
            Competition.Status initialStatus = c.getStatus();
            Competition.Status computedStatus = computeStatus(c, now);
            Competition.Status targetStatus = computedStatus != null ? computedStatus : initialStatus;

            if (initialStatus != targetStatus) {
                c.setStatus(targetStatus);
                competitionRepository.save(c);
                log.info("Competition '{}' (id={}) changed status: {} -> {}", 
                        c.getTitle(), c.getId(), initialStatus, targetStatus);
            }
        }
    }

    Competition.Status computeStatus(Competition competition, LocalDateTime now) {
        Competition.Status initialStatus = competition.getStatus();
        LocalDateTime start = parseDate(competition.getStartDate());
        LocalDateTime end = parseDate(competition.getDeadline());

        Competition.Status targetStatus;
        if (start != null && now.isBefore(start)) {
            targetStatus = Competition.Status.UPCOMING;
        } else if (end != null && now.isAfter(end)) {
            targetStatus = Competition.Status.COMPLETED;
        } else if (start != null || end != null) {
            targetStatus = Competition.Status.ONGOING;
        } else {
            targetStatus = initialStatus;
        }

        return targetStatus != initialStatus ? targetStatus : null;
    }

    /** Parses an ISO date string, handling both LocalDateTime and ZonedDateTime formats */
    private LocalDateTime parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            if (dateStr.endsWith("Z") || dateStr.contains("+")) {
                return ZonedDateTime.parse(dateStr).toLocalDateTime();
            }
            return LocalDateTime.parse(dateStr);
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
