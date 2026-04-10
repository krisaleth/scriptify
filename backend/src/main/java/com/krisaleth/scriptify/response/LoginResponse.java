package com.krisaleth.scriptify.response;

public class LoginResponse {
    private String token;
    private Long expiresIn;

    // Constructor mặc định (Bắt buộc phải có để Jackson làm việc)
    public LoginResponse() {
    }

    public LoginResponse(String token, Long expiresIn) {
        this.token = token;
        this.expiresIn = expiresIn;
    }

    // Viết tay Getter (Đừng dùng @Data lúc này để test)
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(Long expiresIn) { this.expiresIn = expiresIn; }
}