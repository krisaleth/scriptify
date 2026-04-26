package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.entity.Song;
import com.krisaleth.scriptify.entity.Users;
import com.krisaleth.scriptify.response.UserResponse;
import com.krisaleth.scriptify.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * LẤY THÔNG TIN CÁ NHÂN (Dùng cho Auth Store ở React)
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> authenticatedUser(Authentication authentication) {
        if (authentication == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);

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
     * CẬP NHẬT PROFILE (Đồng bộ với UserService.updateProfile)
     */
    @PutMapping(value = "/update-profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Users> updateProfile(
            @RequestParam(value = "nickname", required = false) String nickname, // Khớp với biến nickname ở Service
            @RequestParam(value = "avatar", required = false) MultipartFile avatarFile, // Khớp với biến avatarFile ở Service
            Authentication authentication) {

        Users currentUser = userService.getUserByEmail(authentication.getName());

        // Gọi Service: updateProfile(Long userId, String nickname, MultipartFile avatarFile)
        Users updatedUser = userService.updateProfile(currentUser.getId(), nickname, avatarFile);

        return ResponseEntity.ok(updatedUser);
    }

    /**
     * ĐỔI MẬT KHẨU (Đồng bộ với UserService.changePassword)
     */
    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @RequestParam String currentPassword,
            @RequestParam String newPassword,
            Authentication authentication) {

        Users currentUser = userService.getUserByEmail(authentication.getName());

        // Gọi Service: changePassword(Long userId, String currentPassword, String newPassword)
        userService.changePassword(currentUser.getId(), currentPassword, newPassword);

        return ResponseEntity.ok().build();
    }

    /**
     * LẤY DANH SÁCH YÊU THÍCH (Cho mục Heart Beats ở Profile)
     */
    @GetMapping("/favorites")
    public ResponseEntity<Set<Song>> getFavorites(Authentication authentication) {
        return ResponseEntity.ok(userService.getFavoriteSongs(authentication.getName()));
    }

    /**
     * ADMIN: LẤY TOÀN BỘ USER
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
     * ADMIN: XÓA NGƯỜI DÙNG
     */
    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}