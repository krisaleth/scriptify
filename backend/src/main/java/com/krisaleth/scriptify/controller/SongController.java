package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.entity.Song;
import com.krisaleth.scriptify.service.SongService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
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
     * Thay vì trả về Resource, ta Redirect tới link R2 để tối ưu băng thông
     */
    @GetMapping("/{id}/play")
    public ResponseEntity<Void> playSong(@PathVariable Long id) {
        Song song = songService.getSong(id);

        // 1. Tăng lượt nghe (Logic thống kê của bồ vẫn giữ nguyên)
        songService.incrementViewCount(id);

        String cloudUrl = publicUrl + "/" + song.getFilePath();

        // 3. Trả về mã 302 (Found) để Player tự động tìm tới link nhạc trên mây
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(cloudUrl))
                .build();
    }

    // --- THÊM NHẠC ---
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Song> createSong(
            @RequestParam("title") String title,
            @RequestParam("artistId") Long artistId,
            @RequestParam(value = "albumId", required = false) Long albumId,
            @RequestParam("songFile") MultipartFile musicFile,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        System.out.println("Backend: Đang upload bài hát lên R2 - " + title);
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

        System.out.println("Backend: Cập nhật bài hát trên R2 ID: " + id);
        Song updatedSong = songService.updateSong(id, title, artistId, albumId, musicFile, imageFile);
        return ResponseEntity.ok(updatedSong);
    }

    // --- TÌM KIẾM & PHÂN TRANG ---
    @GetMapping
    public ResponseEntity<Page<Song>> searchSongs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String albumTitle,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(songService.searchSongs(title, albumTitle, page, size));
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