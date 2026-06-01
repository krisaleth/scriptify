package com.krisaleth.scriptify.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Async
public class EmailService {

    private final Resend resend;

    @Value("${app.mail.from}")
    private String fromEmail;

    // Tự động inject API Key từ file properties để khởi tạo Resend client
    public EmailService(@Value("${resend.api.key}") String apiKey) {
        this.resend = new Resend(apiKey);
    }

    // Đã loại bỏ hoàn toàn "throws MessagingException"
    public void sendVerificationEmail(String to, String subject, String htmlContent) {
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(to)
                .subject(subject)
                .html(htmlContent)
                .build();

        try {
            CreateEmailResponse data = resend.emails().send(params);
            System.out.println("Email OTP sent successfully. ID: " + data.getId());
        } catch (ResendException e) {
            // Log lỗi nội bộ tại đây, giúp hàm không bị crash ra tầng Controller
            System.err.println("Lỗi hệ thống khi gửi email qua Resend SDK: " + e.getMessage());
            e.printStackTrace();
        }
    }
}