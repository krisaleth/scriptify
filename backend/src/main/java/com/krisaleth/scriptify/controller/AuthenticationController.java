package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.dto.UserLoginDto;
import com.krisaleth.scriptify.dto.UserRegisterDto;
import com.krisaleth.scriptify.dto.VerifyUserDto;
import com.krisaleth.scriptify.entity.tktSong;
import com.krisaleth.scriptify.entity.tktUsers;
import com.krisaleth.scriptify.response.LoginResponse;
import com.krisaleth.scriptify.response.UserResponse;
import com.krisaleth.scriptify.service.AuthenticationService;
import com.krisaleth.scriptify.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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

        if (authenticatedUser == null) { throw new BadCredentialsException("Tài khoản hoặc mật khẩu không dúng"); }

        String jwtToken = jwtService.generateToken(authenticatedUser);
        long expirationMillis = jwtService.getExpirationTime();

        ResponseCookie jwtCookie = ResponseCookie.from("jwt", jwtToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(expirationMillis / 1000)
                .sameSite("Lax")
                .build();

        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken(jwtToken);
        loginResponse.setExpiresIn(expirationMillis);

        UserResponse userResponse = new UserResponse();
        userResponse.setId(authenticatedUser.getId());
        userResponse.setNickname(authenticatedUser.getNickname());
        userResponse.setEmail(authenticatedUser.getEmail());
        userResponse.setRole(authenticatedUser.getRole().name());
        userResponse.setAvatarUrl(authenticatedUser.getAvatarUrl());

        if (authenticatedUser.getFavoriteSongs() != null && !authenticatedUser.getFavoriteSongs().isEmpty()) {
            Set<Long> favoriteSongIds = authenticatedUser.getFavoriteSongs().stream()
                    .map(tktSong::getId)
                    .collect(Collectors.toSet());
            userResponse.setFavoriteSongIds(favoriteSongIds);

            List<UserResponse.FavoriteSongShort> favoriteSongsShort = authenticatedUser.getFavoriteSongs().stream()
                    .map(song -> UserResponse.FavoriteSongShort.builder()
                            .id(song.getId())
                            .title(song.getTitle())
                            .imageUrl(song.getImageUrl())
                            .build())
                    .collect(Collectors.toList());
            userResponse.setFavoriteSongs(favoriteSongsShort);
        }

        loginResponse.setUser(userResponse);

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