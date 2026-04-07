package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.dto.AlbumCreateDto;
import com.krisaleth.scriptify.dto.AlbumUpdateDto;
import com.krisaleth.scriptify.entity.Album;
import com.krisaleth.scriptify.service.AlbumService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/albums")
@RequiredArgsConstructor
public class AlbumsController {
    private final AlbumService albumService;

    @GetMapping("/{id}")
    public ResponseEntity<Album> get(@PathVariable Long id) {
        return ResponseEntity.ok(albumService.getById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Album>> search(
            @RequestParam(required = false) String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(albumService.search(title, page, size));
    }

    @GetMapping("/by-artist/{artistId}")
    public ResponseEntity<List<Album>> byArtist(@PathVariable Long artistId) {
        return ResponseEntity.ok(albumService.listByArtist(artistId));
    }

    @GetMapping("/by-artist/{artistId}/top3")
    public ResponseEntity<List<Album>> top3ByArtist(@PathVariable Long artistId) {
        return ResponseEntity.ok(albumService.top3ByArtist(artistId));
    }

    @GetMapping("/by-year")
    public ResponseEntity<List<Album>> byYear(@RequestParam Integer year) {
        return ResponseEntity.ok(albumService.byYear(year));
    }

    @GetMapping("/by-year-range")
    public ResponseEntity<List<Album>> byYearRange(@RequestParam Integer start, @RequestParam Integer end) {
        return ResponseEntity.ok(albumService.byYearRange(start, end));
    }

    @GetMapping("/newest")
    public ResponseEntity<List<Album>> newest() {
        return ResponseEntity.ok(albumService.newestTop10());
    }

    @GetMapping("/search-by-artist-name")
    public ResponseEntity<List<Album>> searchByArtistName(@RequestParam String name) {
        return ResponseEntity.ok(albumService.searchByArtistName(name));
    }

    @GetMapping("/search-with-artist")
    public ResponseEntity<List<Album>> searchWithArtist(@RequestParam String title) {
        return ResponseEntity.ok(albumService.searchWithArtistTitle(title));
    }

    @PostMapping("")
    public ResponseEntity<Album> create(@RequestBody AlbumCreateDto dto) {
        return ResponseEntity.ok(albumService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Album> update(@PathVariable Long id, @RequestBody AlbumUpdateDto dto) {
        return ResponseEntity.ok(albumService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        albumService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

