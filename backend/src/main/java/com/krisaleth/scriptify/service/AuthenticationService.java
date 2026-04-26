package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.dto.UserLoginDto;
import com.krisaleth.scriptify.dto.UserRegisterDto;
import com.krisaleth.scriptify.dto.VerifyUserDto;
import com.krisaleth.scriptify.entity.Role;
import com.krisaleth.scriptify.entity.Users;
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
import java.util.Optional;

@Service
@RequiredArgsConstructor // Tự động tạo Constructor cho các final fields
public class AuthenticationService {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final CloudStorageService cloudStorageService;

    @Transactional
    public Users signUp(UserRegisterDto input) {
        Users users = new Users();
        String nickname = input.getNickname();
        if (nickname == null || nickname.isBlank()) {
            nickname = input.getEmail().split("@")[0];
        }
        if (usersRepository.existsByNickname(nickname)) {
            nickname = nickname + System.currentTimeMillis() % 1000;
        }
        users.setNickname(nickname);

        if (usersRepository.findByEmail(input.getEmail()).isPresent()) {
            throw new RuntimeException("Email này đã được sử dụng rồi bạn ơi!");
        }
        users.setEmail(input.getEmail());
        users.setPassword(passwordEncoder.encode(input.getPassword()));

        users.setRole(Role.USER);
        users.setVerificationCode(generateVerificationCode());
        users.setVerificationExpiration(LocalDateTime.now().plusMinutes(10));
        users.setEnabled(false);

        // 2. Xử lý lưu Avatar lên Cloudflare R2
        if (input.getAvatarFile() != null && !input.getAvatarFile().isEmpty()) {
            // Dùng service R2 để upload vào folder 'avatars'
            String cloudPath = cloudStorageService.uploadFile(input.getAvatarFile(), "avatars");
            users.setAvatarUrl(cloudPath);
        } else {
            users.setAvatarUrl("assets/default-avatar.png");
        }

        // 3. Gửi mail và lưu vào DB
        sendVerificationEmail(users);
        return usersRepository.save(users);
    }

    public Users authenticate(UserLoginDto input) {
        Users users = usersRepository.findByEmail(input.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(input.getEmail(), input.getPassword())
        );

        if (!users.isEnabled()) {
            throw new RuntimeException("Account not verified!");
        }
        return users;
    }

    @Transactional
    public void verifyUser(VerifyUserDto input) {
        Users users = usersRepository.findByEmail(input.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (users.getVerificationExpiration().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification has expired!");
        }

        if (users.getVerificationCode().equals(input.getVerificationCode())) {
            users.setEnabled(true);
            users.setVerificationCode(null);
            users.setVerificationExpiration(null);
            usersRepository.save(users);
        } else {
            throw new RuntimeException("Invalid verification code!");
        }
    }

    @Transactional
    public void resendVerificationCode(String email) {
        Users users = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (users.isEnabled()) {
            throw new RuntimeException("User is already verified");
        }

        users.setVerificationCode(generateVerificationCode());
        users.setVerificationExpiration(LocalDateTime.now().plusMinutes(10));
        sendVerificationEmail(users);
        usersRepository.save(users);
    }

    public void sendVerificationEmail(Users users) {
        String subject = "Account Verification";
        String verificationCode = users.getVerificationCode();
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
            emailService.sendVerificationEmail(users.getEmail(), subject, htmlMessage);
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