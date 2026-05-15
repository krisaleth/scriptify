package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.entity.tktAlbum;
import com.krisaleth.scriptify.entity.tktArtist;
import com.krisaleth.scriptify.repository.AlbumRepository;
import com.krisaleth.scriptify.repository.ArtistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;
    private final S3Client s3Client;

    @Value("${r2.bucket-name}")
    private String bucketName;

    private String uploadImageToR2(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return "images/default-album.png";

        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }

        String fileName = "images/" + UUID.randomUUID().toString() + extension;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

        return fileName;
    }

    private void deleteFromR2(String relativePath) {
        if (relativePath != null && !relativePath.contains("default-album.png")) {
            try {
                DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(relativePath)
                        .build();
                s3Client.deleteObject(deleteObjectRequest);
            } catch (Exception e) {
                System.err.println("R2 Error: " + e.getMessage());
            }
        }
    }

    @Transactional
    public tktAlbum create(String title, Integer releaseYear, Long artistId, MultipartFile imageFile) {
        if (title == null || title.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tiêu đề không được trống");

        tktArtist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không thấy nghệ sĩ"));

        try {
            String savedPath = uploadImageToR2(imageFile);
            tktAlbum album = new tktAlbum();
            album.setTitle(title);
            album.setReleaseYear(releaseYear);
            album.setArtist(artist);
            album.setCoverImageUrl(savedPath);
            return albumRepository.save(album);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi Cloud Storage");
        }
    }

    @Transactional
    public tktAlbum update(Long id, String title, Integer releaseYear, Long artistId, MultipartFile imageFile) {
        tktAlbum existing = getById(id);

        if (title != null) existing.setTitle(title);
        if (releaseYear != null) existing.setReleaseYear(releaseYear);

        if (artistId != null) {
            tktArtist artist = artistRepository.findById(artistId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nghệ sĩ không tồn tại"));
            existing.setArtist(artist);
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String oldPath = existing.getCoverImageUrl();
                String savedPath = uploadImageToR2(imageFile);
                existing.setCoverImageUrl(savedPath);
                deleteFromR2(oldPath);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi cập nhật ảnh");
            }
        }
        return albumRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        tktAlbum album = getById(id);
        String imagePath = album.getCoverImageUrl();
        try {
            albumRepository.delete(album);
            deleteFromR2(imagePath);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Album đang chứa bài hát sếp ơi!");
        }
    }

    @Transactional(readOnly = true)
    public List<tktAlbum> findAllByArtistId(Long artistId) {
        if (!artistRepository.existsById(artistId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nghệ sĩ không tồn tại");
        }
        return albumRepository.findByTktArtist_TktIdOrderByTktReleaseYearDesc(artistId);
    }

    @Transactional(readOnly = true)
    public tktAlbum getById(Long id) {
        return albumRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Album không tồn tại"));
    }

    @Transactional(readOnly = true)
    public Page<tktAlbum> search(String title, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "tktId"));
        return (title != null && !title.isBlank())
                ? albumRepository.findByTktTitleContainingIgnoreCase(title, pageable)
                : albumRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<tktAlbum> getAllPaginated(Pageable pageable) {
        return albumRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public List<tktAlbum> getAll() {
        return albumRepository.findAll(Sort.by(Sort.Direction.ASC, "tktTitle"));
    }
}