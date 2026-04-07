package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.entity.Song;
import com.krisaleth.scriptify.service.SongService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/songs")
@RequiredArgsConstructor
public class SongsController {
    private final SongService songService;

    @GetMapping("/{id}")
    public ResponseEntity<Song> get(@PathVariable Long id) {
        return ResponseEntity.ok(songService.getSong(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Song>> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String albumTitle,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(songService.searchSongs(title, albumTitle, page, size));
    }

    @GetMapping("/top")
    public ResponseEntity<List<Song>> top() {
        return ResponseEntity.ok(songService.topSongs());
    }

    @GetMapping("/random")
    public ResponseEntity<List<Song>> random(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(songService.randomSongs(limit));
    }

    @GetMapping("/by-artist/{artistId}")
    public ResponseEntity<List<Song>> byArtist(@PathVariable Long artistId) {
        return ResponseEntity.ok(songService.songsByArtistId(artistId));
    }

    @PostMapping(path = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Song> create(
            @RequestParam String title,
            @RequestParam(required = false) Integer duration,
            @RequestParam(required = false) Long albumId,
            @RequestPart MultipartFile musicFile,
            @RequestPart(required = false) MultipartFile imageFile
    ) {
        return ResponseEntity.ok(songService.createSong(title, duration, albumId, musicFile, imageFile));
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Song> update(
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Integer duration,
            @RequestParam(required = false) Long albumId,
            @RequestPart(required = false) MultipartFile musicFile,
            @RequestPart(required = false) MultipartFile imageFile
    ) {
        return ResponseEntity.ok(songService.updateSong(id, title, duration, albumId, musicFile, imageFile));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        songService.deleteSong(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Song> incrementView(@PathVariable Long id) {
        return ResponseEntity.ok(songService.incrementViewCount(id));
    }
}

