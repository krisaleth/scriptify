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
        long expirationMillis = jwtService.getExpirationTime();

        // 3. Tạo HttpOnly Cookie
        ResponseCookie jwtCookie = ResponseCookie.from("jwt", jwtToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(expirationMillis / 1000)
                .sameSite("Lax")
                .build();

        // 4. Trả về Response
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

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("UP");
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