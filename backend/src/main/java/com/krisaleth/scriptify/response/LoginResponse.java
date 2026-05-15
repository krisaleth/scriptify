package com.krisaleth.scriptify.response;

import com.krisaleth.scriptify.entity.tktUsers; // Import entity User của bạn

public class LoginResponse {
    private String token;
    private Long expiresIn;
    private tktUsers user; // ✅ Thêm trường này để Sidebar có data nạp ngay

    public LoginResponse() {
    }

    // Constructor đầy đủ
    public LoginResponse(String token, Long expiresIn, tktUsers user) {
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
    public tktUsers getUser() { return user; }
    public void setUser(tktUsers user) { this.user = user; }
}