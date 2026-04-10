package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.entity.Song;
import com.krisaleth.scriptify.service.SongService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/songs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SongController {
    private final SongService songService;

    // --- STREAMING NHẠC ---
    @GetMapping("/{id}/play")
    public ResponseEntity<Resource> playSong(@PathVariable Long id) {
        Resource audioFile = songService.playSong(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + audioFile.getFilename() + "\"")
                .contentType(MediaType.parseMediaType("audio/mpeg")) // Dùng parse để an toàn hơn
                .body(audioFile);
    }

    // --- CREATE: THÊM NHẠC ---
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Song> createSong(
            @RequestParam("title") String title,
            @RequestParam("artistId") Long artistId,
            @RequestParam(value = "albumId", required = false) Long albumId,
            @RequestParam("songFile") MultipartFile musicFile,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        System.out.println("Backend: Đang tạo bài hát mới - " + title);

        Song savedSong = songService.createSong(title, artistId, albumId, musicFile, imageFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedSong);
    }

    // --- UPDATE: SỬA NHẠC ---
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Song> updateSong(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "artistId", required = false) Long artistId,
            @RequestParam(value = "albumId", required = false) Long albumId,
            @RequestParam(value = "songFile", required = false) MultipartFile musicFile,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        System.out.println("Backend: Đang cập nhật bài hát ID: " + id);

        Song updatedSong = songService.updateSong(id, title, artistId, albumId, musicFile, imageFile);
        return ResponseEntity.ok(updatedSong);
    }

    // --- CÁC API CƠ BẢN ---
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

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> incrementViewCount(@PathVariable Long id) {
        songService.incrementViewCount(id);
        return ResponseEntity.ok().build();
    }
}