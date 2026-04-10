package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.entity.Album;
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
@CrossOrigin(origins = "*") // Đảm bảo React gọi API không bị block
public class AlbumController {
    private final AlbumService albumService;

    /**
     * CREATE ALBUM
     * Nhận FormData từ Dashboard: title, releaseYear, artistId, imageFile
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Album> createAlbum(
            @RequestParam("title") String title,
            @RequestParam(value = "releaseYear", required = false) Integer releaseYear,
            @RequestParam("artistId") Long artistId,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        System.out.println("Backend: Đang tạo Album mới cho Artist ID: " + artistId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(albumService.create(title, releaseYear, artistId, imageFile));
    }

    /**
     * UPDATE ALBUM
     * Dùng cho chức năng Edit (Cây bút) trên Admin Dashboard
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Album> updateAlbum(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "releaseYear", required = false) Integer releaseYear,
            @RequestParam(value = "artistId", required = false) Long artistId,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        System.out.println("Backend: Cập nhật Album ID: " + id);
        return ResponseEntity.ok(albumService.update(id, title, releaseYear, artistId, imageFile));
    }

    /**
     * DELETE ALBUM
     * Service đã xử lý xóa file vật lý và bẫy lỗi Foreign Key
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlbum(@PathVariable Long id) {
        albumService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // --- READ OPERATIONS ---

    @GetMapping
    public ResponseEntity<Page<Album>> searchAlbums(
            @RequestParam(required = false) String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(albumService.search(title, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Album> getAlbumById(@PathVariable Long id) {
        return ResponseEntity.ok(albumService.getById(id));
    }

    /**
     * LẤY DANH SÁCH ALBUM THEO NGHỆ SĨ
     * Dùng cho trang Artist Detail / Discography
     */
    @GetMapping("/artist/{artistId}")
    public ResponseEntity<List<Album>> getAlbumsByArtist(@PathVariable Long artistId) {
        // Gọi hàm findAllByArtistId tui vừa thêm trong Service để lấy list đầy đủ
        return ResponseEntity.ok(albumService.findAllByArtistId(artistId));
    }
}