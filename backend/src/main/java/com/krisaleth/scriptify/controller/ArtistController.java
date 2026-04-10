package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.entity.Artist;
import com.krisaleth.scriptify.service.ArtistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/artists")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Đồng bộ với cổng 5173 của React
public class ArtistController {
    private final ArtistService artistService;

    /**
     * CREATE ARTIST
     * Nhận FormData từ Dashboard: name, bio, imageFile
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Artist> createArtist(
            @RequestParam("name") String name,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        System.out.println("Backend: Đang tạo Nghệ sĩ - " + name);

        Artist savedArtist = artistService.create(name, bio, imageFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedArtist);
    }

    /**
     * UPDATE ARTIST
     * Hỗ trợ nút Pencil ở Admin Dashboard
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Artist> updateArtist(
            @PathVariable Long id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        System.out.println("Backend: Cập nhật Nghệ sĩ ID: " + id);

        Artist updatedArtist = artistService.update(id, name, bio, imageFile);
        return ResponseEntity.ok(updatedArtist);
    }

    // --- READ OPERATIONS ---

    @GetMapping
    public ResponseEntity<Page<Artist>> searchArtists(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(artistService.search(name, page, size));
    }

    /**
     * LẤY TOÀN BỘ (Dùng cho ô Select ở Dashboard)
     */
    @GetMapping("/all")
    public ResponseEntity<List<Artist>> getAllArtists() {
        return ResponseEntity.ok(artistService.getAllArtistsList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Artist> getArtistById(@PathVariable Long id) {
        return ResponseEntity.ok(artistService.getById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArtist(@PathVariable Long id) {
        artistService.delete(id);
        return ResponseEntity.noContent().build();
    }
}