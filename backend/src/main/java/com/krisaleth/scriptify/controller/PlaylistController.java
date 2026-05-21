package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.dto.PlaylistCreateDto;
import com.krisaleth.scriptify.dto.PlaylistUpdateDto;
import com.krisaleth.scriptify.entity.tktPlaylist;
import com.krisaleth.scriptify.entity.tktUsers;
import com.krisaleth.scriptify.repository.UsersRepository;
import com.krisaleth.scriptify.response.PlaylistResponse;
import com.krisaleth.scriptify.service.PlaylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType; // Thêm cái này
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/playlists")
@RequiredArgsConstructor
public class PlaylistController {
    private final PlaylistService playlistService;
    private final UsersRepository usersRepository;

    private tktUsers getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập");
        }
        return usersRepository.findByTktEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));
    }

    @GetMapping("/me")
    public ResponseEntity<List<PlaylistResponse>> getMyPlaylists(Authentication auth) {
        return ResponseEntity.ok(playlistService.listMyPlaylists(getCurrentUser(auth)));
    }

    @GetMapping("/public")
    public ResponseEntity<Page<PlaylistResponse>> getPublicPlaylists(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10) Pageable pageable) {

        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(playlistService.searchPublicPlaylists(search, pageable));
        }
        return ResponseEntity.ok(playlistService.listPublicPlaylists(pageable));
    }

    /**
     * ✅ TẠO PLAYLIST: Chuyển sang @ModelAttribute để nhận File Thumbnail
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PlaylistResponse> createPlaylist(
            @ModelAttribute PlaylistCreateDto dto,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(playlistService.create(dto, getCurrentUser(auth)));
    }

    /**
     * ✅ CẬP NHẬT PLAYLIST: Hỗ trợ đổi ảnh bìa hoặc đổi tên/mô tả
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PlaylistResponse> updatePlaylist(
            @PathVariable Long id,
            @ModelAttribute PlaylistUpdateDto dto, // Đổi từ @RequestBody
            Authentication auth) {
        return ResponseEntity.ok(playlistService.update(id, dto, getCurrentUser(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlaylist(@PathVariable Long id, Authentication auth) {
        playlistService.delete(id, getCurrentUser(auth));
        return ResponseEntity.noContent().build();
    }

    // --- QUẢN LÝ BÀI HÁT TRONG PLAYLIST (Các API này không dùng File nên giữ nguyên) ---

    @PostMapping("/{id}/songs/{songId}")
    public ResponseEntity<PlaylistResponse> addSongToPlaylist(
            @PathVariable Long id,
            @PathVariable Long songId,
            Authentication auth) {
        return ResponseEntity.ok(playlistService.addSong(id, getCurrentUser(auth), songId));
    }

    @DeleteMapping("/{id}/songs/{songId}")
    public ResponseEntity<PlaylistResponse> removeSongFromPlaylist(
            @PathVariable Long id,
            @PathVariable Long songId,
            Authentication auth) {
        return ResponseEntity.ok(playlistService.removeSong(id, getCurrentUser(auth), songId));
    }
}