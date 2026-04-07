package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.dto.ArtistCreateDto;
import com.krisaleth.scriptify.dto.ArtistUpdateDto;
import com.krisaleth.scriptify.entity.Artist;
import com.krisaleth.scriptify.service.ArtistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/artists")
@RequiredArgsConstructor
public class ArtistsController {
    private final ArtistService artistService;

    @GetMapping("/{id}")
    public ResponseEntity<Artist> get(@PathVariable Long id) {
        return ResponseEntity.ok(artistService.getById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Artist>> search(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(artistService.search(name, page, size));
    }

    @GetMapping("/popular")
    public ResponseEntity<List<Artist>> popular(@RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(artistService.popular(size));
    }

    @GetMapping("/newest")
    public ResponseEntity<List<Artist>> newest() {
        return ResponseEntity.ok(artistService.newestTop10());
    }

    @GetMapping("/random")
    public ResponseEntity<List<Artist>> random(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(artistService.random(limit));
    }

    @PostMapping("")
    public ResponseEntity<Artist> create(@RequestBody ArtistCreateDto dto) {
        return ResponseEntity.ok(artistService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Artist> update(@PathVariable Long id, @RequestBody ArtistUpdateDto dto) {
        return ResponseEntity.ok(artistService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        artistService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

