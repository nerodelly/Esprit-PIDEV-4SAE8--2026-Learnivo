package com.learnivo.demo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
        }
    }

    public void sendVerificationEmail(String to, String token, String appUrl) {
        String subject = "Learnivo - Please verify your email address";
        String body = "Thank you for registering. Please click on the below link to activate your account:\n\n"
                + appUrl + "/verify?token=" + token;
        sendEmail(to, subject, body);
    }
    
    public void sendWelcomeEmail(String to) {
        String subject = "Learnivo - Welcome!";
        String body = "Your account has been successfully verified. Welcome to Learnivo!";
        sendEmail(to, subject, body);
    }

    public void sendSuspensionEmail(String to) {
        String subject = "Learnivo - Account Suspended";
        String body = "Your account has been suspended by an administrator. Please contact support for more information.";
        sendEmail(to, subject, body);
    }

    public void sendDeletionEmail(String to) {
        String subject = "Learnivo - Account Deleted";
        String body = "Hello, your Learnivo account has been successfully deleted. If this was a mistake, please contact support.";
        sendEmail(to, subject, body);
    }
}
