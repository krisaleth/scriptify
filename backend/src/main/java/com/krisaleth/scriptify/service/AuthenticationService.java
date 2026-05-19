package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.dto.UserLoginDto;
import com.krisaleth.scriptify.dto.UserRegisterDto;
import com.krisaleth.scriptify.dto.VerifyUserDto;
import com.krisaleth.scriptify.entity.tktRole;
import com.krisaleth.scriptify.entity.tktUsers;
import com.krisaleth.scriptify.repository.UsersRepository;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final CloudStorageService cloudStorageService;

    @Transactional
    public tktUsers signUp(UserRegisterDto input) {
        tktUsers user = new tktUsers();
        String nickname = input.getNickname();

        if (nickname == null || nickname.isBlank()) {
            nickname = input.getEmail().split("@")[0];
        }

        if (usersRepository.existsByTktNickname(nickname)) {
            nickname = nickname + System.currentTimeMillis() % 1000;
        }

        user.setNickname(nickname);

        if (usersRepository.existsByTktEmail(input.getEmail())) {
            throw new RuntimeException("Email này đã được sử dụng rồi bạn ơi!");
        }

        user.setEmail(input.getEmail());
        user.setPassword(passwordEncoder.encode(input.getPassword()));
        user.setRole(tktRole.USER);
        user.setVerificationCode(generateVerificationCode());
        user.setVerificationExpiration(LocalDateTime.now().plusMinutes(10));
        user.setEnabled(false);

        if (input.getAvatarFile() != null && !input.getAvatarFile().isEmpty()) {
            String cloudPath = cloudStorageService.uploadFile(input.getAvatarFile(), "avatars");
            user.setAvatarUrl(cloudPath);
        } else {
            user.setAvatarUrl("assets/default-avatar.png");
        }

        sendVerificationEmail(user);
        return usersRepository.save(user);
    }

    public tktUsers authenticate(UserLoginDto input) {
        tktUsers user = usersRepository.findByTktEmail(input.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(input.getEmail(), input.getPassword())
        );

        if (!user.isEnabled()) {
            throw new RuntimeException("Account not verified!");
        }
        return user;
    }

    @Transactional
    public void verifyUser(VerifyUserDto input) {
        tktUsers user = usersRepository.findByTktEmail(input.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getVerificationExpiration().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification has expired!");
        }

        if (user.getVerificationCode().equals(input.getVerificationCode())) {
            user.setEnabled(true);
            user.setVerificationCode(null);
            user.setVerificationExpiration(null);
            usersRepository.save(user);
        } else {
            throw new RuntimeException("Invalid verification code!");
        }
    }

    @Transactional
    public void resendVerificationCode(String email) {
        tktUsers user = usersRepository.findByTktEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEnabled()) {
            throw new RuntimeException("User is already verified");
        }

        user.setVerificationCode(generateVerificationCode());
        user.setVerificationExpiration(LocalDateTime.now().plusMinutes(10));
        sendVerificationEmail(user);
        usersRepository.save(user);
    }

    public void sendVerificationEmail(tktUsers user) {
        String subject = "Account Verification";
        String verificationCode = user.getVerificationCode();
        String htmlMessage = "<html>"
                + "<head><meta charset=\"UTF-8\"></head>"
                + "<body style=\"font-family: Arial, sans-serif;\">"
                + "<div style=\"background-color: #f5f5f5; padding: 20px;\">"
                + "<h2 style=\"color: #333;\">Chào mừng đến với Scriptify!</h2>"
                + "<p style=\"font-size: 16px;\">Mã xác thực của bạn là:</p>"
                + "<div style=\"background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">"
                + "<h3 style=\"color: #333;\">Verification Code:</h3>"
                + "<p style=\"font-size: 24px; font-weight: bold; color: #22c55e;\">" + verificationCode + "</p>"
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";
        try {
            emailService.sendVerificationEmail(user.getEmail(), subject, htmlMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        int code = random.nextInt(900000) + 100000;
        return String.valueOf(code);
    }
}