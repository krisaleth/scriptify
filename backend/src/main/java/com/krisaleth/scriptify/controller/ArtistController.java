package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.entity.tktArtist;
import com.krisaleth.scriptify.response.ArtistResponse;
import com.krisaleth.scriptify.service.ArtistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/artists")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ArtistController {
    private final ArtistService artistService;

    /**
     * CREATE ARTIST
     * Đẩy ảnh trực tiếp lên Cloudflare R2 folder /artists
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<tktArtist> createArtist(
            @RequestParam("name") String name,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        System.out.println("R2 Storage: Đang tạo Nghệ sĩ - " + name);

        tktArtist savedTktArtist = artistService.create(name, bio, imageFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTktArtist);
    }

    /**
     * UPDATE ARTIST
     * Xóa ảnh cũ trên R2 và thay bằng ảnh mới nếu có truyền vào
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<tktArtist> updateArtist(
            @PathVariable Long id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        System.out.println("R2 Storage: Đang cập nhật Nghệ sĩ ID: " + id);

        tktArtist updatedTktArtist = artistService.update(id, name, bio, imageFile);
        return ResponseEntity.ok(updatedTktArtist);
    }

    /**
     * LẤY TOÀN BỘ VỚI VIEW & TOP SONGS
     * Endpoint cực quan trọng để render trang Spotlight của Scriptify
     */
    @GetMapping("/all-with-views")
    public ResponseEntity<List<ArtistResponse>> getAllWithViews() {
        return ResponseEntity.ok(artistService.getAllWithViews());
    }

    /**
     * SEARCH & PHÂN TRANG
     * Dùng cho Admin Dashboard để quản lý danh sách
     */
    @GetMapping
    public ResponseEntity<Page<ArtistResponse>> searchArtists(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<tktArtist> artistPage = artistService.search(name, page, size);

        Page<ArtistResponse> responsePage = artistPage.map(artist -> {
            // Tính toán lượt view từ danh sách bài hát (prefix tkt)
            long totalViews = (artist.getSongs() != null) ? artist.getSongs().stream()
                                                               .mapToLong(s -> s.getViewCount() != null ? s.getViewCount() : 0L)
                                                               .sum() : 0L;

            // Map danh sách 5 bài hát đứng đầu (nếu cần hiển thị ở list)
            List<ArtistResponse.SongShortResponse> topSongs = (artist.getSongs() != null) ?
                    artist.getSongs().stream()
                    .sorted((s1, s2) -> Long.compare(
                            s2.getViewCount() != null ? s2.getViewCount() : 0L,
                            s1.getViewCount() != null ? s1.getViewCount() : 0L))
                    .limit(5)
                    .map(s -> ArtistResponse.SongShortResponse.builder()
                              .id(s.getId())
                              .title(s.getTitle())
                              .viewCount(s.getViewCount())
                              .imageUrl(s.getImageUrl())
                              .build())
                    .toList() : Collections.emptyList();

            return ArtistResponse.builder()
                    .id(artist.getId())
                    .name(artist.getName())
                    .bio(artist.getBio())
                    .imageUrl(artist.getImageUrl())
                    .totalViews(totalViews)
                    .songCount(artist.getSongs() != null ? artist.getSongs().size() : 0)
                    .topSongs(topSongs)
                    .build();
        });

        return ResponseEntity.ok(responsePage);
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<tktArtist> getArtistById(@PathVariable Long id) {
        return ResponseEntity.ok(artistService.getById(id));
    }

    /**
     * XÓA NGHỆ SĨ
     * Tự động dọn dẹp file trên R2 sau khi xóa record trong DB
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArtist(@PathVariable Long id) {
        artistService.delete(id);
        return ResponseEntity.noContent().build();
    }
}