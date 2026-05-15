package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.entity.tktSong;
import com.krisaleth.scriptify.response.SongResponse;
import com.krisaleth.scriptify.service.SongService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    @GetMapping("/{id}/play")
    public ResponseEntity<Void> playSong(@PathVariable Long id) {
        SongResponse song = songService.getSong(id);
        songService.incrementViewCount(id);

        String cloudUrl = publicUrl + "/" + song.getFilePath();

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(cloudUrl))
                .build();
    }

    @GetMapping
    public ResponseEntity<Page<SongResponse>> getSongs(
            @RequestParam(required = false) String query,
            @PageableDefault(size = 20, sort = "tktCreatedAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<SongResponse> songPage;

        if (query != null && !query.isBlank()) {
            songPage = songService.searchSongs(query, pageable);
        } else {
            songPage = songService.getAllSongs(pageable);
        }

        return ResponseEntity.ok(songPage);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SongResponse> createSong(
            @RequestParam("title") String title,
            @RequestParam("artistId") Long artistId,
            @RequestParam(value = "albumId", required = false) Long albumId,
            @RequestParam("songFile") MultipartFile musicFile,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        SongResponse savedSong = songService.createSong(title, artistId, albumId, musicFile, imageFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedSong);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SongResponse> updateSong(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "artistId", required = false) Long artistId,
            @RequestParam(value = "albumId", required = false) Long albumId,
            @RequestParam(value = "songFile", required = false) MultipartFile musicFile,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        SongResponse updatedSong = songService.updateSong(id, title, artistId, albumId, musicFile, imageFile);
        return ResponseEntity.ok(updatedSong);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SongResponse> getSong(@PathVariable Long id) {
        return ResponseEntity.ok(songService.getSong(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSong(@PathVariable Long id) {
        songService.deleteSong(id);
        return ResponseEntity.noContent().build();
    }
}