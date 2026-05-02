package com.odishapolice.casediary.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;

    @Value("${email.from}")
    private String fromEmail;

    @Value("${email.from.name}")
    private String fromName;

    // ================= IO EMAIL =================
    public void sendIoCredentials(String toEmail, String ioName, String username, String temporaryPassword) {
        try {
            Email from = new Email(fromEmail, fromName);
            Email to = new Email(toEmail);

            String subject = "Your Investigation Officer Account Credentials - Case Diary System";
            String htmlContent = buildIoCredentialsEmail(ioName, username, temporaryPassword);

            Content content = new Content("text/html", htmlContent);
            Mail mail = new Mail(from, subject, to, content);

            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();

            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);

            // 🔥 DEBUG LOGS
            System.out.println("SENDGRID STATUS (IO): " + response.getStatusCode());
            System.out.println("SENDGRID BODY (IO): " + response.getBody());

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("IO email sent successfully to: {}", toEmail);
            } else {
                log.error("Failed to send IO email. Status: {}, Body: {}",
                        response.getStatusCode(), response.getBody());
                throw new RuntimeException("Failed to send IO email");
            }

        } catch (Exception e) {
            e.printStackTrace(); // 🔥 IMPORTANT
            log.error("Error sending IO email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send IO email");
        }
    }

    // ================= SUPERVISOR EMAIL =================
    public void sendSupervisorCredentials(String toEmail, String supervisorName, String username, String temporaryPassword) {
        try {
            Email from = new Email(fromEmail, fromName);
            Email to = new Email(toEmail);

            String subject = "Your Supervisor Account Credentials - Case Diary System";
            String htmlContent = buildSupervisorCredentialsEmail(supervisorName, username, temporaryPassword);

            Content content = new Content("text/html", htmlContent);
            Mail mail = new Mail(from, subject, to, content);

            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();

            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);

            // 🔥 DEBUG LOGS
            System.out.println("SENDGRID STATUS (SUPERVISOR): " + response.getStatusCode());
            System.out.println("SENDGRID BODY (SUPERVISOR): " + response.getBody());

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("Supervisor email sent successfully to: {}", toEmail);
            } else {
                log.error("Failed to send supervisor email. Status: {}, Body: {}",
                        response.getStatusCode(), response.getBody());
                throw new RuntimeException("Failed to send Supervisor email");
            }

        } catch (Exception e) {
            e.printStackTrace(); // 🔥 IMPORTANT
            log.error("Error sending supervisor email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send Supervisor email");
        }
    }

    // ================= SUPERVISOR TEMPLATE =================
    private String buildSupervisorCredentialsEmail(String supervisorName, String username, String temporaryPassword) {
        return """
                <h2>Supervisor Account Created</h2>
                <p>Dear %s,</p>
                <p>Username: %s</p>
                <p>Password: %s</p>
                """.formatted(supervisorName, username, temporaryPassword);
    }

    // ================= IO TEMPLATE =================
    private String buildIoCredentialsEmail(String ioName, String username, String temporaryPassword) {
        return """
                <h2>Investigation Officer Account Created</h2>
                <p>Dear %s,</p>
                <p>Username: %s</p>
                <p>Password: %s</p>
                """.formatted(ioName, username, temporaryPassword);
    }
}