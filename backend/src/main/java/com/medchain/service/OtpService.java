package com.medchain.service;

import com.medchain.entity.Otp;
import com.medchain.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpRepository otpRepository;
    private final JavaMailSender mailSender;
    private final Logger log = LoggerFactory.getLogger(OtpService.class);
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${mail.from}")
    private String senderEmail;

    public String generateAndSendOtp(String email, String purpose) {
        // remove previous otps for purpose
        otpRepository.deleteByEmailAndPurpose(email, purpose);

        // generate 6-digit numeric code
        int code = 100000 + secureRandom.nextInt(900000);
        String codeStr = String.valueOf(code);

        Otp otp = new Otp();
        otp.setEmail(email);
        otp.setCode(codeStr);
        otp.setPurpose(purpose);
        otp.setExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));
        otpRepository.save(otp);

        sendOtpEmail(email, codeStr, purpose);
        log.info("OTP for {} (purpose={}): {}", email, purpose, codeStr);

        return codeStr;
    }

    @Value("${app.mail.require-delivery:true}")
    private boolean requireDelivery;

    private void sendOtpEmail(String recipientEmail, String otpCode, String purpose) {
        String subject = "MedChain verification code";
        String body = "Your MedChain verification code is: " + otpCode + "\nThis code expires in 10 minutes.\nIf you did not request this code, you can ignore this email.";

        if (purpose != null) {
            switch (purpose.toUpperCase()) {
                case "REGISTER":
                    subject = "MedChain account verification code";
                    body = "Use the following code to complete your MedChain registration:\n" + otpCode + "\nThis code expires in 10 minutes.\nIf you did not request this registration, you can ignore this email.";
                    break;
                case "FORGOT_PASSWORD":
                    subject = "MedChain password reset code";
                    body = "Use the following code to reset your MedChain password:\n" + otpCode + "\nThis code expires in 10 minutes.\nIf you did not request a password reset, please ignore this email or contact support.";
                    break;
                case "CHANGE_PASSWORD":
                    subject = "MedChain password change code";
                    body = "Use the following code to confirm your MedChain password change:\n" + otpCode + "\nThis code expires in 10 minutes.\nIf you did not request a password change, please contact support immediately.";
                    break;
                default:
                    subject = "MedChain verification code";
                    body = "Your MedChain verification code is: " + otpCode + "\nThis code expires in 10 minutes.\nIf you did not request this code, you can ignore this email.";
            }
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(recipientEmail);
        message.setSubject(subject);
        message.setText(body);
        try {
            mailSender.send(message);
        } catch (Exception ex) {
            // Log failure details
            log.error("Unable to send OTP email to {}: {}", recipientEmail, ex.getMessage());
            log.error("OTP email failure details", ex);
            if (requireDelivery) {
                // In production or when delivery required, fail as before
                throw new IllegalStateException("Unable to send verification email. Verify the configured SMTP app password and sender account.", ex);
            } else {
                // Dev fallback: log the OTP and continue so registration/flows are not blocked
                log.info("[DEV FALLBACK] OTP for {} (purpose={}): {} — email delivery failed, continuing in dev mode", recipientEmail, purpose, otpCode);
            }
        }
    }

    public boolean verifyOtp(String email, String purpose, String code) {
        return otpRepository.findByEmailAndPurposeAndCode(email, purpose, code)
                .filter(o -> o.getExpiresAt().isAfter(Instant.now()))
                .isPresent();
    }

    public void consumeOtp(String email, String purpose, String code) {
        otpRepository.findByEmailAndPurposeAndCode(email, purpose, code).ifPresent(o -> otpRepository.delete(o));
    }
}
