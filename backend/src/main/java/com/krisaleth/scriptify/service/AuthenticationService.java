package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.dto.UserLoginDto;
import com.krisaleth.scriptify.dto.UserRegisterDto;
import com.krisaleth.scriptify.dto.VerifyUserDto;
import com.krisaleth.scriptify.entity.Role;
import com.krisaleth.scriptify.entity.Users;
import com.krisaleth.scriptify.repository.UsersRepository;

import jakarta.mail.MessagingException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthenticationService {
    private final UsersRepository usersRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    private final EmailService emailService;

    public AuthenticationService(
            UsersRepository usersRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            EmailService emailService
    ) {
        this.usersRepository = usersRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    @Transactional
    public Users signUp(UserRegisterDto input) {
        // 1. Khởi tạo đối tượng User với các thông tin cơ bản
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
            throw new RuntimeException("Email này đã được sử dụng rồi bồ ơi!");
        }
        users.setEmail(input.getEmail());

        users.setPassword(passwordEncoder.encode(input.getPassword()));

        users.setRole(Role.USER);
        users.setVerificationCode(generateVerificationCode());
        users.setVerificationExpiration(LocalDateTime.now().plusMinutes(10));
        users.setEnabled(false);

        // 2. Xử lý lưu Avatar (nếu có)
        if (input.getAvatarFile() != null && !input.getAvatarFile().isEmpty()) {
            try {
                // Lấy đường dẫn gốc của project để tránh mkdirs bị ignore hoặc tạo sai chỗ
                String projectDir = System.getProperty("user.dir");

                // Thống nhất dùng folder "uploads/avatars" bên trong project
                String relativePath = "uploads" + File.separator + "avatars";
                File dir = new File(projectDir, relativePath);

                // Tạo thư mục nếu chưa tồn tại (tạo cả folder cha nếu cần)
                if (!dir.exists()) {
                    dir.mkdirs();
                }

                // Tạo tên file duy nhất
                String fileName = System.currentTimeMillis() + "_" + input.getAvatarFile().getOriginalFilename();

                // Lưu file vật lý dùng resolve để tự động xử lý dấu gạch chéo
                Path filePath = dir.toPath().resolve(fileName);
                Files.copy(input.getAvatarFile().getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // LƯU Ý: Set đường dẫn vào DB khớp với pattern của WebConfig
                // WebConfig bồ config là /uploads/** nên ở đây phải bắt đầu bằng /uploads/
                users.setAvatarUrl("/uploads/avatars/" + fileName);

            } catch (IOException e) {
                throw new RuntimeException("Lỗi khi lưu file ảnh: " + e.getMessage());
            }
        } else {
            // Ảnh mặc định - bồ nhớ bỏ 1 file default-avatar.png vào folder uploads/avatars nhé
            users.setAvatarUrl("/uploads/avatars/default-avatar.png");
        }

        // 3. Gửi mail và lưu vào DB
        sendVerificationEmail(users);
        return usersRepository.save(users);
    }

    public Users authenticate(UserLoginDto input) {
        Users users = usersRepository.findByEmail(input.getEmail()).orElseThrow(() -> new RuntimeException("User not found"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getEmail(), input.getPassword()
                )
        );

        if (!users.isEnabled()) {
            throw new RuntimeException("Account not verified!");
        }

        return users;
    }

    public void verifyUser(VerifyUserDto input) {
        Optional<Users> optionalUsers = usersRepository.findByEmail(input.getEmail());
        if (optionalUsers.isPresent()) {
            Users users = optionalUsers.get();
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
        else {
            throw new RuntimeException("User not found");
        }
    }

    public void resendVerificationCode(String email) {
        Optional<Users> optionalUsers = usersRepository.findByEmail(email);
        if (optionalUsers.isPresent()) {
            Users users = optionalUsers.get();
            if (users.isEnabled()) {
                throw new RuntimeException("User is already verified");
            }
            users.setVerificationCode(generateVerificationCode());
            users.setVerificationExpiration(LocalDateTime.now().plusMinutes(10));
            sendVerificationEmail(users);
            usersRepository.save(users);
        }
        else {
            throw new RuntimeException("User not found");
        }
    }

    public void sendVerificationEmail(Users users) {
        String subject = "Account Verification";
        String verificationCode = users.getVerificationCode();
        String htmlMessage = "<html>"
                + "<body style=\"font-family: Arial, sans-serif;\">"
                + "<div style=\"background-color: #f5f5f5; padding: 20px;\">"
                + "<h2 style=\"color: #333;\">Welcome to our app!</h2>"
                + "<p style=\"font-size: 16px;\">Please enter the verification code below to continue:</p>"
                + "<div style=\"background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">"
                + "<h3 style=\"color: #333;\">Verification Code:</h3>"
                + "<p style=\"font-size: 18px; font-weight: bold; color: #007bff;\">" + verificationCode + "</p>"
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

