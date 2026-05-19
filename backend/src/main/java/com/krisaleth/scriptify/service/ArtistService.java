package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.entity.tktArtist;
import com.krisaleth.scriptify.repository.ArtistRepository;
import com.krisaleth.scriptify.response.ArtistResponse;
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
public class ArtistService {
    private final ArtistRepository artistRepository;
    private final S3Client s3Client; // Inject S3Client đã config

    @Value("${r2.bucket-name}")
    private String bucketName;

    // --- HÀM HỖ TRỢ LƯU FILE LÊN R2 ---
    private String uploadImageToR2(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return "assets/default-artist.png";

        // Lưu vào folder artists trên R2
        String fileName = "artists/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
        return fileName;
    }

    private void deleteFromR2(String relativePath) {
        // Tránh xóa ảnh mặc định của hệ thống
        if (relativePath != null && !relativePath.contains("default-artist.png") && !relativePath.contains("assets/")) {
            try {
                DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(relativePath)
                        .build();
                s3Client.deleteObject(deleteObjectRequest);
            } catch (Exception e) {
                System.err.println("Lỗi xóa file ảnh trên R2: " + relativePath);
            }
        }
    }

    // --- CÁC PHƯƠNG THỨC CHÍNH ---

    @Transactional
    public tktArtist create(String name, String bio, MultipartFile imageFile) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên nghệ sĩ không được để trống");
        }

        try {
            String relativePath = uploadImageToR2(imageFile);
            tktArtist tktArtist = new tktArtist();
            tktArtist.setName(name.trim());
            tktArtist.setBio(bio != null ? bio.trim() : "");
            tktArtist.setImageUrl(relativePath); // Lưu path: artists/uuid_name.jpg

            return artistRepository.save(tktArtist);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lưu ảnh lên Cloud");
        }
    }

    @Transactional
    public tktArtist update(Long id, String name, String bio, MultipartFile imageFile) {
        tktArtist existing = getById(id);

        if (name != null && !name.isBlank()) existing.setName(name.trim());
        if (bio != null) existing.setBio(bio.trim());

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                // Dọn dẹp ảnh cũ trên Cloud
                deleteFromR2(existing.getImageUrl());
                String relativePath = uploadImageToR2(imageFile);
                existing.setImageUrl(relativePath);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi cập nhật ảnh lên Cloud");
            }
        }
        return artistRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        tktArtist tktArtist = getById(id);
        try {
            String imageUrl = tktArtist.getImageUrl();
            artistRepository.delete(tktArtist);
            deleteFromR2(imageUrl); // Xóa trên Cloud sau khi xóa DB thành công
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể xóa nghệ sĩ này vì họ vẫn còn Album hoặc Bài hát gắn liền bạn ơi!"
            );
        }
    }

    @Transactional(readOnly = true)
    public List<ArtistResponse> getAllWithViews() {
        List<tktArtist> tktArtists = artistRepository.findAllWithSongsFetch();

        return tktArtists.stream().map(artist -> {
            long totalViews = artist.getSongs().stream()
                    .mapToLong(s -> s.getViewCount() != null ? s.getViewCount() : 0L)
                    .sum();

            int songCount = artist.getSongs().size();

            List<ArtistResponse.SongShortResponse> topSongs = artist.getSongs().stream()
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
                    .toList();

            return ArtistResponse.builder()
                    .id(artist.getId())
                    .name(artist.getName())
                    .bio(artist.getBio())
                    .imageUrl(artist.getImageUrl()) // Trả về Relative Path
                    .totalViews(totalViews)
                    .songCount(songCount)
                    .topSongs(topSongs)
                    .build();
        }).toList();
    }

    @Transactional(readOnly = true)
    public Page<tktArtist> search(String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        if (name == null || name.isBlank()) {
            return artistRepository.findAll(pageable);
        }
        return artistRepository.findByTktNameContainingIgnoreCase(name, pageable);
    }

    @Transactional(readOnly = true)
    public tktArtist getById(Long id) {
        return artistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nghệ sĩ ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<tktArtist> getAllArtistsList() {
        return artistRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));
    }
}