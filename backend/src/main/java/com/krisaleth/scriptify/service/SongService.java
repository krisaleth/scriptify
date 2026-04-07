package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.entity.Album;
import com.krisaleth.scriptify.entity.Song;
import com.krisaleth.scriptify.repository.AlbumRepository;
import com.krisaleth.scriptify.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SongService {
    private final SongRepository songRepository;

    private final AlbumRepository albumRepository;
    @Value("${app.upload.music-dir}")
    private String musicDir;

    @Value("${app.upload.image-dir}")
    private String imageDir;

    // Save file function
    private String saveFile(MultipartFile file, String uploadDir) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String safeOriginalFilename = (originalFilename == null || originalFilename.isBlank()) ? "file" : originalFilename;
        String fileName = UUID.randomUUID() + "_" + safeOriginalFilename;
        Path copyPath = Paths.get(uploadDir).resolve(fileName);

        createDirIfNotExists(uploadDir);
        Files.copy(file.getInputStream(), copyPath, StandardCopyOption.REPLACE_EXISTING);
        return fileName;
    }

    // Create dir if not exist
    private void createDirIfNotExists(String dir) throws IOException {
        Path path = Paths.get(dir);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }
    }

    @Transactional
    public Song createSong(
            String title,
            Integer duration,
            Long albumId,
            MultipartFile musicFile,
            MultipartFile imageFile
    ) {
        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Song title is required");
        }
        if (musicFile == null || musicFile.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "musicFile is required");
        }

        String savedMusicFileName;
        try {
            savedMusicFileName = saveFile(musicFile, musicDir);
        } catch (IOException e) {
            throw new ResponseStatusException(500, "Failed to upload music file", e);
        }

        String imageUrl = "default-cover.png";
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String savedImageFileName = saveFile(imageFile, imageDir);
                imageUrl = "images/" + savedImageFileName;
            } catch (IOException e) {
                throw new ResponseStatusException(500, "Failed to upload image file", e);
            }
        }

        Album album = null;
        if (albumId != null) {
            album = albumRepository.findById(albumId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Album not found"));
        }

        Song song = new Song();
        song.setTitle(title);
        song.setDuration(duration);
        song.setFilePath("music/" + savedMusicFileName);
        song.setImageUrl(imageUrl);
        song.setAlbum(album);

        return songRepository.save(song);
    }

    @Transactional
    public Song updateSong(
            Long id,
            String title,
            Integer duration,
            Long albumId,
            MultipartFile musicFile,
            MultipartFile imageFile
    ) {
        Song existing = songRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found"));

        if (title != null && !title.isBlank()) {
            existing.setTitle(title);
        }
        if (duration != null) {
            existing.setDuration(duration);
        }

        if (albumId != null) {
            Album album = albumRepository.findById(albumId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Album not found"));
            existing.setAlbum(album);
        } else {
            existing.setAlbum(null);
        }

        if (musicFile != null && !musicFile.isEmpty()) {
            try {
                String savedMusicFileName = saveFile(musicFile, musicDir);
                existing.setFilePath("music/" + savedMusicFileName);
            } catch (IOException e) {
                throw new ResponseStatusException(500, "Failed to upload music file", e);
            }
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String savedImageFileName = saveFile(imageFile, imageDir);
                existing.setImageUrl("images/" + savedImageFileName);
            } catch (IOException e) {
                throw new ResponseStatusException(500, "Failed to upload image file", e);
            }
        }

        return songRepository.save(existing);
    }

    @Transactional
    public void deleteSong(Long id) {
        if (!songRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found");
        }
        songRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Song getSong(Long id) {
        return songRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found"));
    }

    @Transactional(readOnly = true)
    public Page<Song> searchSongs(String title, String albumTitle, Pageable pageable) {
        boolean hasTitle = title != null && !title.isBlank();
        boolean hasAlbumTitle = albumTitle != null && !albumTitle.isBlank();

        if (hasTitle && hasAlbumTitle) {
            return songRepository.findByTitleContainingIgnoreCaseOrAlbumTitleContainingIgnoreCase(
                    title,
                    albumTitle,
                    pageable
            );
        }
        if (hasTitle) {
            return songRepository.findByTitleContainingIgnoreCase(title, pageable);
        }
        if (hasAlbumTitle) {
            return songRepository.findByAlbum_TitleContainingIgnoreCase(albumTitle, pageable);
        }
        return songRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Song> searchSongs(String title, String albumTitle, int page, int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );
        return searchSongs(title, albumTitle, pageable);
    }

    @Transactional(readOnly = true)
    public List<Song> topSongs() {
        return songRepository.findTop10ByOrderByViewCountDesc();
    }

    @Transactional(readOnly = true)
    public List<Song> randomSongs(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        return songRepository.findRandomSongs(safeLimit);
    }

    @Transactional(readOnly = true)
    public List<Song> songsByArtistId(Long artistId) {
        if (artistId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "artistId is required");
        }
        return songRepository.findByAlbum_Artist_Id(artistId);
    }

    @Transactional
    public Song incrementViewCount(Long id) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id is required");
        }
        if (!songRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found");
        }
        songRepository.incrementViewCount(id);
        return songRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found"));
    }

    @Transactional(readOnly = true)
    public Integer getTotalDurationByAlbumId(Long albumId) {
        if (albumId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "albumId is required");
        }
        return songRepository.getTotalDurationByAlbumId(albumId);
    }

}
