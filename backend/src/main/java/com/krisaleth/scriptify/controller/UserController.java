package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.entity.Users;
import com.krisaleth.scriptify.response.UserResponse;
import com.krisaleth.scriptify.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    /**
     * LẤY THÔNG TIN CÁ NHÂN
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> authenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Users user = userService.getMyProfile(authentication.getName());

        return ResponseEntity.ok(new UserResponse(
                user.getId(),
                user.getNickname(),
                user.getEmail(),
                user.getRole().name(),
                user.getAvatarUrl()
        ));
    }

    /**
     * LẤY TOÀN BỘ USER (Admin Dashboard)
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
     * CẬP NHẬT PROFILE
     * Chuyển sang nhận MultipartFile để upload lên R2
     */
    @PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Users> updateProfile(
            @RequestParam(value = "displayName", required = false) String displayName,
            @RequestParam(value = "avatar", required = false) MultipartFile avatarFile,
            Authentication authentication) {

        String email = authentication.getName();
        Users currentUser = userService.getUserByEmail(email);

        // Gọi Service đã sửa để xử lý logic R2
        Users updatedUser = userService.updateProfile(currentUser.getId(), displayName, avatarFile);

        return ResponseEntity.ok(updatedUser);
    }

    /**
     * XÓA NGƯỜI DÙNG (Chỉ Admin)
     */
    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}