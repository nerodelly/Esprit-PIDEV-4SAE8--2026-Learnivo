package com.learnivo.classservice.service;

import com.learnivo.classservice.entity.EnrolledStudent;
import com.learnivo.classservice.entity.PlatformClass;
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
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.instructor-email:}")
    private String instructorEmail; // email de l'instructeur principal (fallback)

    // ── Email élève ────────────────────────────────────────────────────

    @Async
    public void sendEnrollmentConfirmation(EnrolledStudent student,
                                            PlatformClass cls,
                                            String meetLink) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(student.getEmail());
            helper.setSubject("✅ Enrollment Confirmed — " + cls.getTitle());
            helper.setText(buildStudentEmail(student, cls, meetLink), true);

            mailSender.send(msg);
            log.info("[EMAIL] Confirmation envoyée à {}", student.getEmail());
        } catch (MessagingException e) {
            log.error("[EMAIL] Erreur envoi élève : {}", e.getMessage());
        }
    }

    // ── Email instructeur ──────────────────────────────────────────────

    @Async
    public void sendInstructorNotification(EnrolledStudent student,
                                            PlatformClass cls,
                                            String meetLink) {
        // Utilise l'email de l'instructeur configuré ou le fallback
        String to = instructorEmail.isBlank() ? fromEmail : instructorEmail;
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("👤 New Student Enrolled — " + cls.getTitle());
            helper.setText(buildInstructorEmail(student, cls, meetLink), true);

            mailSender.send(msg);
            log.info("[EMAIL] Notification instructeur envoyée à {}", to);
        } catch (MessagingException e) {
            log.error("[EMAIL] Erreur envoi instructeur : {}", e.getMessage());
        }
    }

    // ── Templates HTML ─────────────────────────────────────────────────

    private String buildStudentEmail(EnrolledStudent student, PlatformClass cls, String meetLink) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="font-family: 'Segoe UI', sans-serif; background:#f8f9fa; margin:0; padding:20px;">
              <div style="max-width:600px; margin:0 auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #0d9488, #0f766e); padding:40px 32px; text-align:center;">
                  <h1 style="color:white; margin:0; font-size:28px; font-weight:900;">🎓 You're Enrolled!</h1>
                  <p style="color:rgba(255,255,255,0.8); margin:8px 0 0; font-size:16px;">Your spot is confirmed</p>
                </div>

                <!-- Content -->
                <div style="padding:32px;">
                  <p style="font-size:16px; color:#374151;">Hi <strong>%s</strong>,</p>
                  <p style="color:#6b7280;">You've successfully enrolled in:</p>

                  <!-- Class card -->
                  <div style="background:#f0fdfa; border:1px solid #99f6e4; border-radius:12px; padding:20px; margin:20px 0;">
                    <h2 style="margin:0 0 12px; color:#0f766e; font-size:20px;">%s</h2>
                    <table style="width:100%%; border-collapse:collapse;">
                      <tr><td style="padding:4px 0; color:#6b7280; width:120px;">👨‍🏫 Instructor</td><td style="font-weight:600; color:#111827;">%s</td></tr>
                      <tr><td style="padding:4px 0; color:#6b7280;">📅 Schedule</td><td style="font-weight:600; color:#111827;">%s · %s</td></tr>
                      <tr><td style="padding:4px 0; color:#6b7280;">⏱ Duration</td><td style="font-weight:600; color:#111827;">%s</td></tr>
                      <tr><td style="padding:4px 0; color:#6b7280;">📊 Level</td><td style="font-weight:600; color:#111827;">%s</td></tr>
                    </table>
                  </div>

                  <!-- Meet link -->
                  <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:20px; margin:20px 0; text-align:center;">
                    <p style="margin:0 0 8px; font-weight:700; color:#1e40af; font-size:14px; text-transform:uppercase; letter-spacing:1px;">🎥 Your Google Meet Link</p>
                    <a href="%s" style="display:inline-block; background:#1d4ed8; color:white; padding:12px 28px; border-radius:10px; font-weight:700; text-decoration:none; font-size:15px; margin-top:4px;">
                      Join the Class
                    </a>
                    <p style="margin:10px 0 0; font-size:12px; color:#93c5fd;">%s</p>
                  </div>

                  <p style="color:#6b7280; font-size:14px;">Save this link — you'll use it every session. See you in class! 🚀</p>
                </div>

                <!-- Footer -->
                <div style="background:#f9fafb; padding:20px 32px; text-align:center; border-top:1px solid #e5e7eb;">
                  <p style="color:#9ca3af; font-size:12px; margin:0;">Learnivo Platform · You received this because you enrolled in a class.</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                student.getName(),
                cls.getTitle(),
                cls.getInstructor(),
                cls.getDay(), cls.getTime(),
                cls.getDuration(),
                cls.getLevel(),
                meetLink, meetLink
        );
    }

    private String buildInstructorEmail(EnrolledStudent student, PlatformClass cls, String meetLink) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="font-family: 'Segoe UI', sans-serif; background:#f8f9fa; margin:0; padding:20px;">
              <div style="max-width:600px; margin:0 auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); padding:40px 32px; text-align:center;">
                  <h1 style="color:white; margin:0; font-size:26px; font-weight:900;">👤 New Student Enrolled</h1>
                </div>

                <div style="padding:32px;">
                  <p style="font-size:16px; color:#374151;">Hi <strong>%s</strong>,</p>
                  <p style="color:#6b7280;">A new student just enrolled in your class:</p>

                  <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:12px; padding:20px; margin:20px 0;">
                    <h3 style="margin:0 0 12px; color:#7c3aed;">%s</h3>
                    <table style="width:100%%; border-collapse:collapse;">
                      <tr><td style="padding:4px 0; color:#6b7280; width:120px;">👤 Student</td><td style="font-weight:600;">%s</td></tr>
                      <tr><td style="padding:4px 0; color:#6b7280;">📧 Email</td><td style="font-weight:600;">%s</td></tr>
                      <tr><td style="padding:4px 0; color:#6b7280;">📅 Enrolled</td><td style="font-weight:600;">%s</td></tr>
                      <tr><td style="padding:4px 0; color:#6b7280;">👥 Total</td><td style="font-weight:600;">%d / %d students</td></tr>
                    </table>
                  </div>

                  <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:16px; text-align:center;">
                    <p style="margin:0 0 4px; font-weight:700; color:#1e40af; font-size:13px;">🎥 Class Meet Link</p>
                    <a href="%s" style="color:#2563eb; font-size:14px; font-weight:600;">%s</a>
                  </div>
                </div>

                <div style="background:#f9fafb; padding:20px 32px; text-align:center; border-top:1px solid #e5e7eb;">
                  <p style="color:#9ca3af; font-size:12px; margin:0;">Learnivo Platform · Instructor notification</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                cls.getInstructor(),
                cls.getTitle(),
                student.getName(),
                student.getEmail(),
                student.getEnrolledAt(),
                cls.getEnrolled().size(), cls.getMaxCapacity() != null ? cls.getMaxCapacity() : 0,
                meetLink, meetLink
        );
    }
}
