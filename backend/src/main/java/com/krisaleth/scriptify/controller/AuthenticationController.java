package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.dto.UserLoginDto;
import com.krisaleth.scriptify.dto.UserRegisterDto;
import com.krisaleth.scriptify.dto.VerifyUserDto;
import com.krisaleth.scriptify.entity.Users;
import com.krisaleth.scriptify.response.LoginResponse;
import com.krisaleth.scriptify.service.AuthenticationService;
import com.krisaleth.scriptify.service.JwtService;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final JwtService jwtService;
    private final AuthenticationService authenticationService;

    // 1. ĐĂNG KÝ (SIGNUP)
    @PostMapping("/register")
    public ResponseEntity<Users> register(@ModelAttribute UserRegisterDto registerUserDto) {
        Users registeredUser = authenticationService.signUp(registerUserDto);
        return ResponseEntity.ok(registeredUser);
    }

    // 2. ĐĂNG NHẬP (LOGIN) -> Trả về Token và Expiration
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody UserLoginDto loginUserDto) {
        // 1. Gọi Service để check email/pass
        Users authenticatedUser = authenticationService.authenticate(loginUserDto);

        // 2. Tạo JWT Token
        String jwtToken = jwtService.generateToken(authenticatedUser);

        // 3. Tạo HttpOnly Cookie
        ResponseCookie jwtCookie = ResponseCookie.from("jwt", jwtToken)
                .httpOnly(true)    // Quan trọng nhất: JavaScript không thể đọc được
                .secure(false)    // Để false vì bồ đang chạy localhost (HTTP), để true nếu có HTTPS
                .path("/")        // Có hiệu lực cho toàn bộ domain
                .maxAge(7 * 24 * 60 * 60) // Hết hạn sau 7 ngày (giống MaxAge của Token)
                .sameSite("Lax")  // Bảo vệ chống CSRF cơ bản
                .build();

        // 4. Trả về Response
        // Không gửi token trong Body nữa, chỉ gửi thông tin hết hạn hoặc User info
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setExpiresIn(jwtService.getExpirationTime());
        loginResponse.setUser(authenticatedUser);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(loginResponse);
    }

    // 3. XÁC THỰC EMAIL
    @PostMapping("/verify")
    public ResponseEntity<?> verifyUser(VerifyUserDto verifyUserDto) {
        try {
            authenticationService.verifyUser(verifyUserDto);
            return ResponseEntity.ok("Account verified successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. GỬI LẠI MÃ XÁC THỰC
    @PostMapping("/resend")
    public ResponseEntity<?> resendVerificationCode(@RequestParam String email) {
        try {
            authenticationService.resendVerificationCode(email);
            return ResponseEntity.ok("Verification code sent");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Đã đăng xuất thành công");
    }
}