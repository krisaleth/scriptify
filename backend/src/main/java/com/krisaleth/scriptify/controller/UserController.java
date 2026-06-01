package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.dto.ChangePasswordDto;
import com.krisaleth.scriptify.entity.tktSong;
import com.krisaleth.scriptify.entity.tktUsers;
import com.krisaleth.scriptify.response.SongResponse;
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

    @GetMapping("/me")
    public ResponseEntity<UserResponse> authenticatedUser(Authentication authentication) {
        if (authentication == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return ResponseEntity.ok(userService.getMyProfile(authentication.getName()));
    }


    @PutMapping(value = "/update-profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> updateProfile(
            @RequestParam(value = "nickname", required = false) String nickname,
            @RequestParam(value = "avatar", required = false) MultipartFile avatarFile,
            Authentication authentication) {

        UserResponse currentUser = userService.getUserByEmail(authentication.getName());
        UserResponse updatedUser = userService.updateProfile(currentUser.getId(), nickname, avatarFile);

        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @RequestBody ChangePasswordDto request,
            Authentication authentication) {

        UserResponse currentUser = userService.getUserByEmail(authentication.getName());
        userService.changePassword(currentUser.getEmail(), request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/favorites")
    public ResponseEntity<Set<SongResponse>> getFavorites(Authentication authentication) {
        return ResponseEntity.ok(userService.getFavoriteSongs(authentication.getName()));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}