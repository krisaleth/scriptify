package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.dto.ArtistCreateDto;
import com.krisaleth.scriptify.dto.ArtistUpdateDto;
import com.krisaleth.scriptify.entity.Artist;
import com.krisaleth.scriptify.repository.ArtistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArtistService {
    private final ArtistRepository artistRepository;

    public Page<Artist> search(String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));

        if (name == null || name.isBlank()) {
            return artistRepository.findAll(pageable);
        }
        return artistRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    public Artist getById(Long id) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id is required");
        }
        return artistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artist not found"));
    }

    public Artist create(ArtistCreateDto dto) {
        if (dto == null || dto.getName() == null || dto.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name is required");
        }
        Artist artist = new Artist();
        artist.setName(dto.getName());
        artist.setBio(dto.getBio());
        artist.setImageUrl(dto.getImageUrl());
        return artistRepository.save(artist);
    }

    public Artist update(Long id, ArtistUpdateDto dto) {
        Artist existing = getById(id);
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "payload is required");
        }
        if (dto.getName() != null && !dto.getName().isBlank()) {
            existing.setName(dto.getName());
        }
        if (dto.getBio() != null) {
            existing.setBio(dto.getBio());
        }
        if (dto.getImageUrl() != null) {
            existing.setImageUrl(dto.getImageUrl());
        }
        return artistRepository.save(existing);
    }

    public void delete(Long id) {
        if (!artistRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Artist not found");
        }
        artistRepository.deleteById(id);
    }

    public List<Artist> popular(int size) {
        int safeSize = Math.max(1, Math.min(size, 50));
        Pageable pageable = PageRequest.of(0, safeSize);
        return artistRepository.findPopularArtist(pageable);
    }

    public List<Artist> newestTop10() {
        return artistRepository.findTop10ByOrderByIdDesc();
    }

    public List<Artist> random(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        return artistRepository.findRandomArtist(safeLimit);
    }
}

