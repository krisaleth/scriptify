package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.dto.PlaylistCreateDto;
import com.krisaleth.scriptify.dto.PlaylistUpdateDto;
import com.krisaleth.scriptify.entity.Playlist;
import com.krisaleth.scriptify.entity.Users;
import com.krisaleth.scriptify.service.PlaylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/playlists")
@RequiredArgsConstructor
public class PlaylistsController {
    private final PlaylistService playlistService;

    @GetMapping("/public")
    public ResponseEntity<List<Playlist>> publicPlaylists() {
        return ResponseEntity.ok(playlistService.listPublicPlaylists());
    }

    @GetMapping("/me")
    public ResponseEntity<List<Playlist>> myPlaylists(@AuthenticationPrincipal Users user) {
        return ResponseEntity.ok(playlistService.listMyPlaylists(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Playlist> myPlaylist(@PathVariable Long id, @AuthenticationPrincipal Users user) {
        return ResponseEntity.ok(playlistService.getForOwner(id, user));
    }

    @PostMapping("")
    public ResponseEntity<Playlist> create(@RequestBody PlaylistCreateDto dto, @AuthenticationPrincipal Users user) {
        return ResponseEntity.ok(playlistService.create(dto, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Playlist> update(@PathVariable Long id, @RequestBody PlaylistUpdateDto dto, @AuthenticationPrincipal Users user) {
        return ResponseEntity.ok(playlistService.update(id, dto, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, @AuthenticationPrincipal Users user) {
        playlistService.delete(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/songs")
    public ResponseEntity<Playlist> addSongs(
            @PathVariable Long id,
            @RequestBody List<Long> songIds,
            @AuthenticationPrincipal Users user
    ) {
        return ResponseEntity.ok(playlistService.addSongs(id, user, songIds));
    }

    @PostMapping("/{id}/songs/{songId}")
    public ResponseEntity<Playlist> addSong(
            @PathVariable Long id,
            @PathVariable Long songId,
            @AuthenticationPrincipal Users user
    ) {
        return ResponseEntity.ok(playlistService.addSong(id, user, songId));
    }

    @DeleteMapping("/{id}/songs/{songId}")
    public ResponseEntity<Playlist> removeSong(
            @PathVariable Long id,
            @PathVariable Long songId,
            @AuthenticationPrincipal Users user
    ) {
        return ResponseEntity.ok(playlistService.removeSong(id, user, songId));
    }
}

