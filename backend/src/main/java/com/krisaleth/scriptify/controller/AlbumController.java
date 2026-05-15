package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.entity.tktAlbum;
import com.krisaleth.scriptify.service.AlbumService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/albums")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AlbumController {

    private final AlbumService albumService;

    @GetMapping
    public ResponseEntity<Page<tktAlbum>> searchAlbums(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(albumService.search(title, page, size));
    }

    @GetMapping("/all-list")
    public ResponseEntity<List<tktAlbum>> getAllAlbumsList() {
        return ResponseEntity.ok(albumService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<tktAlbum> getAlbumById(@PathVariable Long id) {
        return ResponseEntity.ok(albumService.getById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<tktAlbum> createAlbum(
            @RequestParam("title") String title,
            @RequestParam(value = "releaseYear", required = false) Integer releaseYear,
            @RequestParam("artistId") Long artistId,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(albumService.create(title, releaseYear, artistId, imageFile));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<tktAlbum> updateAlbum(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "releaseYear", required = false) Integer releaseYear,
            @RequestParam(value = "artistId", required = false) Long artistId,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {
        return ResponseEntity.ok(albumService.update(id, title, releaseYear, artistId, imageFile));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlbum(@PathVariable Long id) {
        albumService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/artist/{artistId}")
    public ResponseEntity<List<tktAlbum>> getAlbumsByArtist(@PathVariable Long artistId) {
        return ResponseEntity.ok(albumService.findAllByArtistId(artistId));
    }
}