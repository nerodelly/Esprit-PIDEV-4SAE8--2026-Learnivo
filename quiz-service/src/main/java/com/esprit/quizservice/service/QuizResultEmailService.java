package com.esprit.quizservice.service;

import com.esprit.quizservice.config.QuizMailProperties;
import java.util.List;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class QuizResultEmailService {

    private final JavaMailSender mailSender;
    private final QuizMailProperties mailProperties;

    public QuizResultEmailService(ObjectProvider<JavaMailSender> mailSenderProvider, QuizMailProperties mailProperties) {
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.mailProperties = mailProperties;
    }

    public DeliveryResult sendResultEmail(
            String recipient,
            String subject,
            String preview,
            String callToAction,
            List<String> highlights
    ) {
        if (!mailProperties.isEnabled()) {
            return new DeliveryResult(
                    false,
                    "SIMULATED",
                    "SMTP delivery is disabled. Set QUIZ_EMAIL_ENABLED=true and configure spring.mail.* to send real emails."
            );
        }

        if (mailSender == null) {
            return new DeliveryResult(
                    false,
                    "SIMULATED",
                    "Mail sender is not configured. Set the SMTP environment variables and restart quiz-service."
            );
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailProperties.getFrom());
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(buildBody(preview, callToAction, highlights));

        try {
            mailSender.send(message);
            return new DeliveryResult(true, "SMTP", "Quiz result email sent successfully.");
        } catch (MailException exception) {
            return new DeliveryResult(false, "SIMULATED", "SMTP delivery failed: " + exception.getMostSpecificCause().getMessage());
        }
    }

    private String buildBody(String preview, String callToAction, List<String> highlights) {
        StringBuilder body = new StringBuilder();
        body.append(preview).append(System.lineSeparator()).append(System.lineSeparator());
        body.append("Highlights:").append(System.lineSeparator());
        for (String highlight : highlights) {
            body.append("- ").append(highlight).append(System.lineSeparator());
        }
        body.append(System.lineSeparator()).append(callToAction).append(System.lineSeparator());
        return body.toString();
    }

    public record DeliveryResult(
            boolean delivered,
            String deliveryMode,
            String statusMessage
    ) {
    }
}
