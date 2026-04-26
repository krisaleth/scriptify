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
@CrossOrigin(origins = "*") // Lưu ý: Nginx đã lo phần này, sếp có thể bỏ nếu dùng Tunnel
public class AlbumController {
    private final AlbumService albumService;

    /**
     * ✅ SEARCH & GET ALL (PAGINATED)
     * Trả về danh sách Album phân trang.
     * Nếu không truyền 'title', nó sẽ trả về toàn bộ album theo trang.
     */
    @GetMapping
    public ResponseEntity<Page<Album>> searchAlbums(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(albumService.search(title, page, size));
    }

    /**
     * ✅ GET ALL FOR DROPDOWN (NEW)
     * Dùng để lấy toàn bộ danh sách album cho trang Dashboard/Upload nhạc
     */
    @GetMapping("/all-list")
    public ResponseEntity<List<Album>> getAllAlbumsList() {
        // Tận dụng hàm search(null, 0, Integer.MAX_VALUE) nếu chưa viết hàm findAll
        // Hoặc sếp viết thêm hàm findAll() trong service như tui bàn ở trên
        return ResponseEntity.ok(albumService.search(null, 0, 1000).getContent());
    }

    /**
     * ✅ GET BY ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Album> getAlbumById(@PathVariable Long id) {
        return ResponseEntity.ok(albumService.getById(id));
    }

    /**
     * ✅ CREATE ALBUM
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Album> createAlbum(
            @RequestParam("title") String title,
            @RequestParam(value = "releaseYear", required = false) Integer releaseYear,
            @RequestParam("artistId") Long artistId,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        System.out.println("Scriptify Cloud: Đang khởi tạo Album [" + title + "]...");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(albumService.create(title, releaseYear, artistId, imageFile));
    }

    /**
     * ✅ UPDATE ALBUM
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Album> updateAlbum(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "releaseYear", required = false) Integer releaseYear,
            @RequestParam(value = "artistId", required = false) Long artistId,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        return ResponseEntity.ok(albumService.update(id, title, releaseYear, artistId, imageFile));
    }

    /**
     * ✅ DELETE ALBUM
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlbum(@PathVariable Long id) {
        albumService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * ✅ GET BY ARTIST
     */
    @GetMapping("/artist/{artistId}")
    public ResponseEntity<List<Album>> getAlbumsByArtist(@PathVariable Long artistId) {
        return ResponseEntity.ok(albumService.findAllByArtistId(artistId));
    }
}