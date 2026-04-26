package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.entity.Album;
import com.krisaleth.scriptify.entity.Artist;
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
    private final S3Client s3Client; // Inject S3Client đã cấu hình cho R2

    @Value("${r2.bucket-name}")
    private String bucketName;

    /**
     * ✅ HÀM UPLOAD ẢNH LÊN R2
     * Sử dụng UUID để né sạch lỗi Illegal Character
     */
    private String uploadImageToR2(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return "images/default-album.png";

        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }

        // Tạo key: images/uuid.png
        String fileName = "images/" + UUID.randomUUID().toString() + extension;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

        return fileName; // Lưu đường dẫn tương đối vào DB
    }

    /**
     * ✅ HÀM XÓA ẢNH TRÊN R2
     */
    private void deleteFromR2(String relativePath) {
        if (relativePath != null && !relativePath.contains("default-album.png")) {
            try {
                DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(relativePath)
                        .build();
                s3Client.deleteObject(deleteObjectRequest);
                System.out.println("R2: Đã xóa album cover: " + relativePath);
            } catch (Exception e) {
                System.err.println("R2: Lỗi xóa file: " + relativePath + ". Lỗi: " + e.getMessage());
            }
        }
    }

    // --- CÁC PHƯƠNG THỨC CHÍNH ---

    @Transactional
    public Album create(String title, Integer releaseYear, Long artistId, MultipartFile imageFile) {
        if (title == null || title.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tiêu đề Album không được để trống");

        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy Nghệ sĩ"));

        try {
            String savedPath = uploadImageToR2(imageFile);
            Album album = new Album();
            album.setTitle(title);
            album.setReleaseYear(releaseYear);
            album.setArtist(artist);
            album.setCoverImageUrl(savedPath); // Lưu dạng "images/uuid.jpg"
            return albumRepository.save(album);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi lưu file lên Cloud");
        }
    }

    @Transactional
    public Album update(Long id, String title, Integer releaseYear, Long artistId, MultipartFile imageFile) {
        Album existing = getById(id);

        if (title != null) existing.setTitle(title);
        if (releaseYear != null) existing.setReleaseYear(releaseYear);

        if (artistId != null) {
            Artist artist = artistRepository.findById(artistId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nghệ sĩ không tồn tại"));
            existing.setArtist(artist);
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                // Xóa ảnh cũ trên R2 trước khi cập nhật
                deleteFromR2(existing.getCoverImageUrl());
                String savedPath = uploadImageToR2(imageFile);
                existing.setCoverImageUrl(savedPath);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi cập nhật ảnh lên Cloud");
            }
        }
        return albumRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Album album = getById(id);
        try {
            // Xóa ảnh bìa trên R2
            deleteFromR2(album.getCoverImageUrl());
            albumRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Album đang chứa bài hát, sếp phải xóa hết bài hát trước!");
        }
    }

    @Transactional(readOnly = true)
    public List<Album> findAllByArtistId(Long artistId) {
        if (!artistRepository.existsById(artistId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nghệ sĩ không tồn tại");
        }
        return albumRepository.findByArtist_IdOrderByReleaseYearDesc(artistId);
    }

    @Transactional(readOnly = true)
    public Album getById(Long id) {
        return albumRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Album không tồn tại"));
    }

    @Transactional(readOnly = true)
    public Page<Album> search(String title, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return (title != null && !title.isBlank())
                ? albumRepository.findByTitleContainingIgnoreCase(title, pageable)
                : albumRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Album> getAllPaginated(Pageable pageable) {
        return albumRepository.findAll(pageable);
    }

    // Lấy tất cả album không phân trang (Dùng cho dropdown/select ở trang Upload nhạc)
    @Transactional(readOnly = true)
    public List<Album> getAll() {
        return albumRepository.findAll(Sort.by(Sort.Direction.ASC, "title"));
    }
}