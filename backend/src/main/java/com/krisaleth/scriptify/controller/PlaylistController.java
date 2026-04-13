package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.dto.PlaylistCreateDto;
import com.krisaleth.scriptify.dto.PlaylistUpdateDto;
import com.krisaleth.scriptify.entity.Playlist;
import com.krisaleth.scriptify.entity.Users;
import com.krisaleth.scriptify.repository.UsersRepository;
import com.krisaleth.scriptify.service.PlaylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/playlists")
@RequiredArgsConstructor
public class PlaylistController {
    private final PlaylistService playlistService;
    private final UsersRepository usersRepository; // Dùng để lấy User hiện tại

    // Helper: Lấy User đang đăng nhập từ Context
    private Users getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập");
        }

        // Vì hệ thống dùng Email để đăng nhập, authentication.getName() sẽ trả về Email
        return usersRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));
    }

    @GetMapping("/public")
    public ResponseEntity<List<Playlist>> getPublicPlaylists() {
        return ResponseEntity.ok(playlistService.listPublicPlaylists());
    }

    @PostMapping
    public ResponseEntity<Playlist> createPlaylist(@RequestBody PlaylistCreateDto dto, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(playlistService.create(dto, getCurrentUser(auth)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Playlist> updatePlaylist(@PathVariable Long id, @RequestBody PlaylistUpdateDto dto, Authentication auth) {
        return ResponseEntity.ok(playlistService.update(id, dto, getCurrentUser(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlaylist(@PathVariable Long id, Authentication auth) {
        playlistService.delete(id, getCurrentUser(auth));
        return ResponseEntity.noContent().build();
    }

    // --- QUẢN LÝ BÀI HÁT TRONG PLAYLIST ---
    @PostMapping("/{id}/songs/{songId}")
    public ResponseEntity<Playlist> addSongToPlaylist(@PathVariable Long id, @PathVariable Long songId, Authentication auth) {
        return ResponseEntity.ok(playlistService.addSong(id, getCurrentUser(auth), songId));
    }

    @DeleteMapping("/{id}/songs/{songId}")
    public ResponseEntity<Playlist> removeSongFromPlaylist(@PathVariable Long id, @PathVariable Long songId, Authentication auth) {
        return ResponseEntity.ok(playlistService.removeSong(id, getCurrentUser(auth), songId));
    }
}