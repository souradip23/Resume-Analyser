package com.ai.Resume.analyser.mail;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class mailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${spring.mail.username:a1b2c3d4w7x8y9z0@gmail.com}")
    private String fromEmail;

    public void sentVerifyOtp(String username, String email, String otp) {

        String toEmail = email.charAt(0) + "*********" + email.substring(email.indexOf("@"));
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("email", toEmail);
        context.setVariable("otp", otp);

        String mgs = templateEngine.process("verify-otp", context);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "Resume Analyser");
            helper.setTo(email);
            helper.setSubject("Email verification OTP");
            helper.setText(mgs, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    public void sentResetOtp(String username, String email, String otp) {

        String toEmail = email.charAt(0) + "*********" + email.substring(email.indexOf("@"));
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("email", toEmail);
        context.setVariable("otp", otp);

        String mgs = templateEngine.process("reset-otp", context);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "Resume Analyser");
            helper.setTo(email);
            helper.setSubject("Reset password OTP");
            helper.setText(mgs, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send reset email", e);
        }
    }
}

