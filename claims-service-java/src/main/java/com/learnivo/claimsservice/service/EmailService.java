package com.learnivo.claimsservice.service;

import com.learnivo.claimsservice.entity.Claim;
import com.learnivo.claimsservice.service.AiAnalysisService.SentimentResult;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    private static final String FROM_ADDRESS = "hazem.ankoud10@gmail.com";
    private static final String FROM_NAME    = "Learnivo Platform";

    /**
     * Send email to the assigned agent when a new claim is created.
     */
    @Async
    public void sendNewClaimEmail(Claim claim, SentimentResult analysis) {
        String subject = String.format("[Learnivo] New Claim: %s (Priority: %s)",
                claim.getSubject(), analysis.priority());
        String html = buildNewClaimEmailHtml(claim, analysis);
        sendEmail(claim.getAssignedTo(), subject, html);
    }

    /**
     * Send email to the student when their claim status changes.
     */
    @Async
    public void sendStatusChangeEmail(Claim claim, String newStatus, String adminResponse) {
        String statusLabel = getStatusLabel(newStatus);
        String subject = String.format("[Learnivo] Your claim \"%s\" — %s", claim.getSubject(), statusLabel);
        String html = buildStatusEmailHtml(claim, newStatus, adminResponse);
        sendEmail(claim.getStudentEmail(), subject, html);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void sendEmail(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(FROM_ADDRESS, FROM_NAME);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Email sent to {}", to);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Email send error to {}: {}", to, e.getMessage());
        }
    }

    private String getStatusLabel(String status) {
        return switch (status) {
            case "CREATED"     -> "📋 Created";
            case "IN_PROGRESS" -> "⚙️ In Progress";
            case "RESOLVED"    -> "✅ Resolved";
            case "CLOSED"      -> "🔒 Closed";
            case "REJECTED"    -> "❌ Rejected";
            default            -> status;
        };
    }

    private String buildNewClaimEmailHtml(Claim claim, SentimentResult analysis) {
        String priorityColor = switch (analysis.priority()) {
            case "HIGH"     -> "#ef4444";
            case "CRITICAL" -> "#dc2626";
            case "MEDIUM"   -> "#f59e0b";
            default         -> "#10b981";
        };
        return """
                <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
                  <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px;text-align:center;">
                    <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px;">LEARNIVO</h1>
                    <p style="color:#94a3b8;margin:8px 0 0;">New Claim Received</p>
                  </div>
                  <div style="padding:32px;">
                    <h2 style="color:#1e293b;margin:0 0 16px;">📋 New Claim Submitted</h2>
                    <div style="background:#fff;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid %s;">
                      <p><strong>From:</strong> %s (%s)</p>
                      <p><strong>Subject:</strong> %s</p>
                      <p><strong>Category:</strong> %s</p>
                      <p><strong>AI Priority:</strong> <span style="color:%s;font-weight:700;">%s</span></p>
                      <p><strong>Sentiment:</strong> %s</p>
                      <p><strong>Description:</strong> %s</p>
                    </div>
                    <div style="background:#eff6ff;border-radius:12px;padding:16px;margin:16px 0;">
                      <p style="color:#1e40af;font-weight:600;margin:0 0 8px;">🤖 AI Suggestion:</p>
                      <p style="white-space:pre-line;color:#1e40af;margin:0;">%s</p>
                    </div>
                  </div>
                </div>
                """.formatted(
                priorityColor,
                claim.getStudentName(), claim.getStudentEmail(),
                claim.getSubject(),
                claim.getCategory() != null ? claim.getCategory() : "General",
                priorityColor, analysis.priority(),
                analysis.sentiment(),
                claim.getDescription(),
                analysis.suggestedResponse()
        );
    }

    private String buildStatusEmailHtml(Claim claim, String newStatus, String adminResponse) {
        String statusColor = "RESOLVED".equals(newStatus) || "CLOSED".equals(newStatus)
                ? "#10b981" : "#ef4444";
        String statusIcon = "RESOLVED".equals(newStatus) || "CLOSED".equals(newStatus) ? "✅" : "❌";
        String adminResponseHtml = (adminResponse != null && !adminResponse.isBlank())
                ? "<p style=\"margin:0;\"><strong>Admin Response:</strong> " + adminResponse + "</p>"
                : "";
        return """
                <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
                  <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px;text-align:center;">
                    <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px;">LEARNIVO</h1>
                    <p style="color:#94a3b8;margin:8px 0 0;">Learning Platform</p>
                  </div>
                  <div style="padding:32px;">
                    <h2 style="color:#1e293b;margin:0 0 16px;">Claim Update %s</h2>
                    <p style="color:#475569;">Hello <strong>%s</strong>,</p>
                    <p style="color:#475569;">Your claim regarding <strong>"%s"</strong> has been reviewed by the admin.</p>
                    <div style="background:#fff;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid %s;">
                      <p style="margin:0 0 8px;"><strong>Status:</strong> <span style="color:%s;font-weight:700;">%s</span></p>
                      %s
                    </div>
                    <p style="color:#94a3b8;font-size:13px;margin-top:24px;">This is an automated notification from Learnivo. Please do not reply to this email.</p>
                  </div>
                </div>
                """.formatted(
                statusIcon,
                claim.getStudentName(),
                claim.getSubject(),
                statusColor, statusColor, newStatus,
                adminResponseHtml
        );
    }
}
