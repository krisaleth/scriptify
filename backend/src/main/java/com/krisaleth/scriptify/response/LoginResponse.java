package com.krisaleth.scriptify.response;

import com.krisaleth.scriptify.entity.Users; // Import entity User của bạn

public class LoginResponse {
    private String token;
    private Long expiresIn;
    private Users user; // ✅ Thêm trường này để Sidebar có data nạp ngay

    public LoginResponse() {
    }

    // Constructor đầy đủ
    public LoginResponse(String token, Long expiresIn, Users user) {
        this.token = token;
        this.expiresIn = expiresIn;
        this.user = user;
    }

    // Getter/Setter cho Token
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    // Getter/Setter cho Expiration
    public Long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(Long expiresIn) { this.expiresIn = expiresIn; }

    // ✅ Getter/Setter cho User
    public Users getUser() { return user; }
    public void setUser(Users user) { this.user = user; }
}