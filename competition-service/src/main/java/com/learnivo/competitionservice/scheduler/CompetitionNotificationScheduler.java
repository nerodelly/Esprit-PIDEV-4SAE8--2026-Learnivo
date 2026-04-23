package com.learnivo.competitionservice.scheduler;

import com.learnivo.competitionservice.entity.Competition;
import com.learnivo.competitionservice.entity.Participant;
import com.learnivo.competitionservice.repository.CompetitionRepository;
import com.learnivo.competitionservice.service.CompetitionEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Scheduler qui tourne toutes les heures.
 * Envoie un email à tous les participants d'une compétition dont la deadline
 * est dans moins de 48h (notification à ~48h) ou moins de 24h (notification urgente).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CompetitionNotificationScheduler {

    private final CompetitionRepository competitionRepository;
    private final CompetitionEmailService emailService;

    // Toutes les heures
    @Scheduled(fixedRate = 3_600_000)
    public void checkUpcomingDeadlines() {
        log.info("[SCHEDULER] Vérification des compétitions proches...");

        List<Competition> actives = competitionRepository.findActiveWithParticipants();

        for (Competition comp : actives) {
            try {
                LocalDateTime deadline = parseDeadline(comp.getDeadline());
                if (deadline == null) continue;

                long hoursLeft = ChronoUnit.HOURS.between(LocalDateTime.now(), deadline);

                // Envoie uniquement dans les fenêtres : 47-48h ou 23-24h
                boolean in48hWindow = hoursLeft >= 47 && hoursLeft <= 48;
                boolean in24hWindow = hoursLeft >= 23 && hoursLeft <= 24;

                if (!in48hWindow && !in24hWindow) continue;

                long notifHours = in24hWindow ? 24 : 48;
                log.info("[SCHEDULER] Compétition '{}' → {}h restantes, envoi notifications", comp.getTitle(), hoursLeft);

                for (Participant p : comp.getParticipants()) {
                    if (p.getEmail() != null && !p.getEmail().isBlank()) {
                        emailService.sendUpcomingNotification(comp, p, notifHours);
                    }
                }

            } catch (Exception e) {
                log.error("[SCHEDULER] Erreur pour la compétition #{}: {}", comp.getId(), e.getMessage());
            }
        }
    }

    private LocalDateTime parseDeadline(String deadline) {
        if (deadline == null || deadline.isBlank()) return null;
        try {
            return LocalDateTime.parse(deadline, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (DateTimeParseException e) {
            try {
                // Fallback: "2025-10-15" → fin de journée
                return LocalDateTime.parse(deadline + "T23:59:00", DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (DateTimeParseException ex) {
                log.warn("[SCHEDULER] Format de deadline invalide: {}", deadline);
                return null;
            }
        }
    }
}
