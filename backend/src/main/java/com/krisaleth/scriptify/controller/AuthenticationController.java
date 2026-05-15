package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.dto.UserLoginDto;
import com.krisaleth.scriptify.dto.UserRegisterDto;
import com.krisaleth.scriptify.dto.VerifyUserDto;
import com.krisaleth.scriptify.entity.tktUsers;
import com.krisaleth.scriptify.response.LoginResponse;
import com.krisaleth.scriptify.service.AuthenticationService;
import com.krisaleth.scriptify.service.JwtService;
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

    @PostMapping("/register")
    public ResponseEntity<tktUsers> register(@ModelAttribute UserRegisterDto registerUserDto) {
        tktUsers registeredUser = authenticationService.signUp(registerUserDto);
        return ResponseEntity.ok(registeredUser);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody UserLoginDto loginUserDto) {
        tktUsers authenticatedUser = authenticationService.authenticate(loginUserDto);

        String jwtToken = jwtService.generateToken(authenticatedUser);
        long expirationMillis = jwtService.getExpirationTime();

        ResponseCookie jwtCookie = ResponseCookie.from("jwt", jwtToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(expirationMillis / 1000)
                .sameSite("Lax")
                .build();

        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setExpiresIn(expirationMillis);
        loginResponse.setUser(authenticatedUser);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(loginResponse);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyUser(VerifyUserDto verifyUserDto) {
        try {
            authenticationService.verifyUser(verifyUserDto);
            return ResponseEntity.ok("Account verified successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

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