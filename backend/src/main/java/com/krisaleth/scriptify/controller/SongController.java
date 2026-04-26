package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.entity.Song;
import com.krisaleth.scriptify.service.SongService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort; // PHẢI CÓ IMPORT NÀY
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;

@RestController
@RequestMapping("/songs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SongController {
    private final SongService songService;

    @Value("${r2.public-url}")
    private String publicUrl;

    /**
     * PHÁT NHẠC (REDIRECT STREAMING)
     */
    @GetMapping("/{id}/play")
    public ResponseEntity<Void> playSong(@PathVariable Long id) {
        Song song = songService.getSong(id);
        songService.incrementViewCount(id);

        String cloudUrl = publicUrl + "/" + song.getFilePath();

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(cloudUrl))
                .build();
    }

    /**
     * ✅ LẤY DANH SÁCH NHẠC & SEARCH (Đã Fix Ambiguous mapping)
     * Bỏ Sort.Direction.DESC vì @PageableDefault cần chuỗi hoặc Enum cụ thể
     */
    @GetMapping
    public ResponseEntity<Page<Song>> getSongs(
            @RequestParam(required = false) String query,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        if (query != null && !query.isBlank()) {
            // Đảm bảo trong SongService đã đổi hàm searchSongs nhận thêm Pageable
            return ResponseEntity.ok(songService.searchSongs(query, pageable));
        }
        
        return ResponseEntity.ok(songService.getAllSongs(pageable));
    }

    // --- THÊM NHẠC ---
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Song> createSong(
            @RequestParam("title") String title,
            @RequestParam("artistId") Long artistId,
            @RequestParam(value = "albumId", required = false) Long albumId,
            @RequestParam("songFile") MultipartFile musicFile,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        Song savedSong = songService.createSong(title, artistId, albumId, musicFile, imageFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedSong);
    }

    // --- CẬP NHẬT NHẠC ---
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Song> updateSong(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "artistId", required = false) Long artistId,
            @RequestParam(value = "albumId", required = false) Long albumId,
            @RequestParam(value = "songFile", required = false) MultipartFile musicFile,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        Song updatedSong = songService.updateSong(id, title, artistId, albumId, musicFile, imageFile);
        return ResponseEntity.ok(updatedSong);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Song> getSong(@PathVariable Long id) {
        return ResponseEntity.ok(songService.getSong(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSong(@PathVariable Long id) {
        songService.deleteSong(id);
        return ResponseEntity.noContent().build();
    }
}