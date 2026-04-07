package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.dto.AlbumCreateDto;
import com.krisaleth.scriptify.dto.AlbumUpdateDto;
import com.krisaleth.scriptify.entity.Album;
import com.krisaleth.scriptify.entity.Artist;
import com.krisaleth.scriptify.repository.AlbumRepository;
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
public class AlbumService {
    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;

    public Page<Album> search(String title, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "releaseYear"));

        if (title == null || title.isBlank()) {
            return albumRepository.findAll(pageable);
        }
        return albumRepository.findByTitleContainingIgnoreCase(title, pageable);
    }

    public Album getById(Long id) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id is required");
        }
        return albumRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Album not found"));
    }

    public Album create(AlbumCreateDto dto) {
        if (dto == null || dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }

        Album album = new Album();
        album.setTitle(dto.getTitle());
        album.setReleaseYear(dto.getReleaseYear());

        if (dto.getArtistId() != null) {
            Artist artist = artistRepository.findById(dto.getArtistId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artist not found"));
            album.setArtist(artist);
        }

        return albumRepository.save(album);
    }

    public Album update(Long id, AlbumUpdateDto dto) {
        Album existing = getById(id);
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "payload is required");
        }

        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            existing.setTitle(dto.getTitle());
        }
        if (dto.getReleaseYear() != null) {
            existing.setReleaseYear(dto.getReleaseYear());
        }

        if (dto.getArtistId() != null) {
            Artist artist = artistRepository.findById(dto.getArtistId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artist not found"));
            existing.setArtist(artist);
        }

        return albumRepository.save(existing);
    }

    public void delete(Long id) {
        if (!albumRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Album not found");
        }
        albumRepository.deleteById(id);
    }

    public List<Album> listByArtist(Long artistId) {
        if (artistId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "artistId is required");
        }
        return albumRepository.findByArtist_IdOrderByReleaseYearDesc(artistId);
    }

    public List<Album> top3ByArtist(Long artistId) {
        if (artistId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "artistId is required");
        }
        return albumRepository.findTop3ByArtist_IdOrderByReleaseYearDesc(artistId);
    }

    public List<Album> byYear(Integer year) {
        if (year == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "year is required");
        }
        return albumRepository.findByReleaseYear(year);
    }

    public List<Album> byYearRange(Integer start, Integer end) {
        if (start == null || end == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "start/end are required");
        }
        return albumRepository.findByReleaseYearBetween(start, end);
    }

    public List<Album> newestTop10() {
        return albumRepository.findTop10ByOrderByReleaseYearDesc();
    }

    public List<Album> searchByArtistName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name is required");
        }
        return albumRepository.findByArtist_NameContainingIgnoreCase(name);
    }

    public List<Album> searchWithArtistTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        return albumRepository.findByTitleWithArtist(title);
    }
}

