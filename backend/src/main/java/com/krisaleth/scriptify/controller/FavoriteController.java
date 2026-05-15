package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.entity.tktSong;
import com.krisaleth.scriptify.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FavoriteController {

    private final UserService usersService;

    // Lấy danh sách bài hát đã thích của tôi
    @GetMapping
    public ResponseEntity<Set<tktSong>> getMyFavorites(Authentication auth) {
        return ResponseEntity.ok(usersService.getFavoriteSongs(auth.getName()));
    }

    // Nút Like/Unlike bài hát
    @PostMapping("/{songId}")
    public ResponseEntity<Void> toggleLike(@PathVariable Long songId, Authentication auth) {
        usersService.toggleFavorite(auth.getName(), songId);
        return ResponseEntity.ok().build();
    }
}