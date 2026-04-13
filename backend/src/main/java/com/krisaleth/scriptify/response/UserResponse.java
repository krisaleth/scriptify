package com.krisaleth.scriptify.response;

public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private String role;
    private String avatarUrl; // Đổi tên thành avatarUrl cho khớp với Sidebar bồ đang viết

    public UserResponse() {}

    // Cập nhật Constructor để nhận đầy đủ tham số
    public UserResponse(Long id, String username, String email, String displayName, String role, String avatarUrl) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.displayName = displayName;
        this.role = role;
        this.avatarUrl = avatarUrl;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getDisplayName() { return displayName; }
    public String getRole() { return role; }

    // Thêm Getter này thì Jackson mới lấy được dữ liệu để trả về JSON
    public String getAvatarUrl() { return avatarUrl; }

    // Thêm Setter (nếu cần thiết)
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}