package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.entity.Users;
import com.krisaleth.scriptify.response.UserResponse;
import com.krisaleth.scriptify.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Quan trọng để FE gọi API không bị block
public class UserController {

    private final UserService userService;

    /**
     * LẤY THÔNG TIN CÁ NHÂN (Dùng cho User đang đăng nhập)
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> authenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Users user = userService.getMyProfile(authentication.getName());

        return ResponseEntity.ok(new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole().name(),
                user.getAvatarUrl()
        ));
    }

    /**
     * LẤY TOÀN BỘ USER (Dùng cho Admin Dashboard)
     * Endpoint: GET /api/user/all
     */
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<Page<Users>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    /**
     * CẬP NHẬT PROFILE (Dành cho User)
     */
    @PutMapping("/profile")
    public ResponseEntity<Users> updateProfile(
            @RequestParam(required = false) String displayName,
            @RequestParam(required = false) String avatarUrl,
            Authentication authentication) {

        String email = authentication.getName();
        Users currentUser = userService.getUserByEmail(email);
        return ResponseEntity.ok(userService.updateProfile(currentUser.getId(), displayName, avatarUrl));
    }

    /**
     * XÓA NGƯỜI DÙNG (Chỉ Admin)
     * Dùng cho nút Thùng rác trong Admin Dashboard
     */
    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}