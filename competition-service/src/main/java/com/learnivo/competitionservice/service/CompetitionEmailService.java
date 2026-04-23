package com.learnivo.competitionservice.service;

import com.learnivo.competitionservice.entity.Competition;
import com.learnivo.competitionservice.entity.Participant;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompetitionEmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // ── Notification : compétition proche (envoyée à chaque participant) ──────

    @Async
    public void sendUpcomingNotification(Competition competition, Participant participant, long hoursLeft) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(participant.getEmail());
            helper.setSubject("⏰ Reminder: \"" + competition.getTitle() + "\" closes in " + hoursLeft + "h!");
            helper.setText(buildUpcomingEmail(competition, participant, hoursLeft), true);

            mailSender.send(msg);
            log.info("[EMAIL] Reminder envoyé à {} pour la compétition #{}", participant.getEmail(), competition.getId());
        } catch (MessagingException e) {
            log.error("[EMAIL] Erreur envoi reminder : {}", e.getMessage());
        }
    }

    // ── Email confirmation d'inscription ─────────────────────────────────────

    @Async
    public void sendRegistrationConfirmation(Competition competition, Participant participant) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(participant.getEmail());
            helper.setSubject("🎉 Registration Confirmed — " + competition.getTitle());
            helper.setText(buildConfirmationEmail(competition, participant), true);

            mailSender.send(msg);
            log.info("[EMAIL] Confirmation inscription envoyée à {}", participant.getEmail());
        } catch (MessagingException e) {
            log.error("[EMAIL] Erreur envoi confirmation inscription : {}", e.getMessage());
        }
    }

    private String buildConfirmationEmail(Competition competition, Participant participant) {
        String countdownMsg = "";
        String dateToUse = null;
        String eventLabel = "";

        // Prioritize deadline since it is the most critical date for registrants
        if (competition.getDeadline() != null && !competition.getDeadline().isBlank()) {
            dateToUse = competition.getDeadline();
            eventLabel = "the deadline";
        } else if (competition.getStartDate() != null && !competition.getStartDate().isBlank()) {
            dateToUse = competition.getStartDate();
            eventLabel = "the competition starts";
        }

        if (dateToUse != null) {
            try {
                java.time.LocalDateTime dateObj;
                if (dateToUse.endsWith("Z") || dateToUse.contains("+")) {
                    dateObj = java.time.ZonedDateTime.parse(dateToUse).toLocalDateTime();
                } else {
                    dateObj = java.time.LocalDateTime.parse(dateToUse);
                }
                
                // Compare dates without time to get exact calendar days remaining
                long days = java.time.temporal.ChronoUnit.DAYS.between(
                        java.time.LocalDate.now(), 
                        dateObj.toLocalDate()
                );
                
                if (days > 0) {
                    countdownMsg = "<div style=\"background:#e0e7ff;border:1px solid #a5b4fc;border-radius:12px;padding:16px;margin:20px 0;text-align:center;\"><p style=\"margin:0;font-weight:700;color:#4338ca;\">⏳ Reminder: Only " + days + " days left until " + eventLabel + "!</p></div>";
                } else if (days == 0) {
                    countdownMsg = "<div style=\"background:#ef4444;border:1px solid #fca5a5;border-radius:12px;padding:16px;margin:20px 0;text-align:center;\"><p style=\"margin:0;font-weight:700;color:#991b1b;\">🚨 The deadline is TODAY! Best of luck!</p></div>";
                }
            } catch (Exception e) {
                log.warn("[EMAIL] Could not parse date for countdown: {}", e.getMessage());
            }
        }

        return """
            <!DOCTYPE html>
            <html>
            <body style="font-family:'Segoe UI',sans-serif;background:#f8f9fa;margin:0;padding:20px;">
              <div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                <!-- Header -->
                <div style="background:linear-gradient(135deg,#0d9488,#0f766e);padding:40px 32px;text-align:center;">
                  <h1 style="color:white;margin:0;font-size:28px;font-weight:900;">🎉 You're Registered!</h1>
                  <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:15px;">Your spot is confirmed. Good luck!</p>
                </div>

                <!-- Content -->
                <div style="padding:32px;">
                  <p style="font-size:16px;color:#374151;">Hi <strong>%s</strong>,</p>
                  <p style="color:#6b7280;">You have successfully registered for the following competition:</p>

                  <!-- Competition card -->
                  <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:20px;margin:20px 0;">
                    <h2 style="margin:0 0 12px;color:#0f766e;font-size:20px;">🏆 %s</h2>
                    <table style="width:100%%;border-collapse:collapse;">
                      <tr><td style="padding:5px 0;color:#6b7280;width:130px;">🏷 Category</td><td style="font-weight:600;color:#111827;">%s</td></tr>
                      <tr><td style="padding:5px 0;color:#6b7280;">🥇 Grand Prize</td><td style="font-weight:600;color:#111827;">%s</td></tr>
                      <tr><td style="padding:5px 0;color:#6b7280;">📅 Deadline</td><td style="font-weight:600;color:#111827;">%s</td></tr>
                      <tr><td style="padding:5px 0;color:#6b7280;">📧 Your email</td><td style="font-weight:600;color:#111827;">%s</td></tr>
                    </table>
                  </div>

                  <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:16px;margin:20px 0;text-align:center;">
                    <p style="margin:0;font-weight:700;color:#92400e;">📌 Keep this email as proof of registration</p>
                  </div>

                  %s

                  <p style="color:#6b7280;font-size:14px;">We'll send you a reminder as the deadline approaches. Give it your best! 🚀</p>
                </div>

                <!-- Footer -->
                <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
                  <p style="color:#9ca3af;font-size:12px;margin:0;">Learnivo Platform · Competition registration confirmation</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                participant.getName(),
                competition.getTitle(),
                competition.getCategory(),
                competition.getPrize(),
                competition.getDeadline(),
                participant.getEmail(),
                countdownMsg
        );
    }

    // ── Template HTML ─────────────────────────────────────────────────────────

    private String buildUpcomingEmail(Competition competition, Participant participant, long hoursLeft) {
        String urgencyColor = hoursLeft <= 24 ? "#ef4444" : "#f97316";
        String urgencyText  = hoursLeft <= 24
                ? "🚨 Less than 24 hours left!"
                : "⏰ " + hoursLeft + " hours remaining";

        return """
            <!DOCTYPE html>
            <html>
            <body style="font-family:'Segoe UI',sans-serif;background:#f8f9fa;margin:0;padding:20px;">
              <div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                <!-- Header -->
                <div style="background:linear-gradient(135deg,#0d9488,#0f766e);padding:40px 32px;text-align:center;">
                  <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0 0 8px;text-transform:uppercase;letter-spacing:2px;">Competition Reminder</p>
                  <h1 style="color:white;margin:0;font-size:26px;font-weight:900;">🏆 Don't Miss Out!</h1>
                </div>

                <!-- Content -->
                <div style="padding:32px;">
                  <p style="font-size:16px;color:#374151;">Hi <strong>%s</strong>,</p>
                  <p style="color:#6b7280;">This is a reminder that a competition you're registered for is closing soon:</p>

                  <!-- Competition card -->
                  <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:20px;margin:20px 0;">
                    <h2 style="margin:0 0 8px;color:#0f766e;font-size:20px;">%s</h2>
                    <p style="margin:0 0 12px;color:#6b7280;font-size:14px;">%s</p>
                    <table style="width:100%%;border-collapse:collapse;">
                      <tr><td style="padding:4px 0;color:#6b7280;width:120px;">🏷 Category</td><td style="font-weight:600;color:#111827;">%s</td></tr>
                      <tr><td style="padding:4px 0;color:#6b7280;">🏆 Prize</td><td style="font-weight:600;color:#111827;">%s</td></tr>
                      <tr><td style="padding:4px 0;color:#6b7280;">📅 Deadline</td><td style="font-weight:600;color:#111827;">%s</td></tr>
                    </table>
                  </div>

                  <!-- Urgency badge -->
                  <div style="background:#fff7ed;border:2px solid %s;border-radius:12px;padding:16px;text-align:center;margin:20px 0;">
                    <p style="margin:0;font-weight:900;font-size:18px;color:%s;">%s</p>
                    <p style="margin:8px 0 0;color:#6b7280;font-size:13px;">Make sure your submission is ready!</p>
                  </div>

                  <p style="color:#6b7280;font-size:14px;">Good luck! We believe in you. 🚀</p>
                </div>

                <!-- Footer -->
                <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
                  <p style="color:#9ca3af;font-size:12px;margin:0;">Learnivo Platform · You received this because you are registered for this competition.</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                participant.getName(),
                competition.getTitle(),
                competition.getDescription() != null
                        ? competition.getDescription().substring(0, Math.min(competition.getDescription().length(), 120)) + "..."
                        : "",
                competition.getCategory(),
                competition.getPrize(),
                competition.getDeadline(),
                urgencyColor, urgencyColor, urgencyText
        );
    }
}
