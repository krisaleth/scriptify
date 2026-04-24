package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.entity.Artist;
import com.krisaleth.scriptify.entity.Song;
import com.krisaleth.scriptify.repository.AlbumRepository;
import com.krisaleth.scriptify.repository.ArtistRepository;
import com.krisaleth.scriptify.repository.SongRepository;
import com.krisaleth.scriptify.config.FileUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
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
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SongService {
    private final SongRepository songRepository;
    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;
    private final S3Client s3Client; // Inject S3Client đã config

    @Value("${r2.bucket-name}")
    private String bucketName;

    /**
     * HÀM LƯU FILE LÊN R2 (Thay thế savePhysicalFile)
     */
    private String uploadToR2(MultipartFile file, String folder) throws IOException {
        // Tạo path tương đối: music/uuid_tenfile.mp3
        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }

        // ✅ Tên file mới: folder/uuid.mp3 (Loại bỏ hoàn toàn ký tự lạ/khoảng trắng)
        String fileName = folder + "/" + UUID.randomUUID().toString() + extension;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

        return fileName; // Trả về Relative Path để lưu DB
    }

    /**
     * HÀM XÓA FILE TRÊN R2 (Thay thế deletePhysicalFile)
     */
    private void deleteFromR2(String relativePath) {
        if (relativePath != null && !relativePath.contains("default-cover.png")) {
            try {
                DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(relativePath)
                        .build();
                s3Client.deleteObject(deleteObjectRequest);
            } catch (Exception e) {
                System.err.println("Lỗi xóa file trên R2: " + relativePath);
            }
        }
    }

    @Transactional
    public Song updateSong(Long id, String title, Long artistId, Long albumId, MultipartFile musicFile, MultipartFile imageFile) {
        Song existingSong = getSong(id);

        if (title != null && !title.isBlank()) {
            existingSong.setTitle(title);
        }

        if (artistId != null) {
            Artist artist = artistRepository.findById(artistId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nghệ sĩ không tồn tại"));
            existingSong.setArtist(artist);
        }

        if (albumId != null) {
            albumRepository.findById(albumId).ifPresent(existingSong::setAlbum);
        }

        try {
            // Cập nhật Nhạc
            if (musicFile != null && !musicFile.isEmpty()) {
                deleteFromR2(existingSong.getFilePath()); // Xóa trên Cloud
                String relativePath = uploadToR2(musicFile, "music");
                existingSong.setFilePath(relativePath);
                existingSong.setDuration(FileUtils.getMp3Duration(musicFile));
            }

            // Cập nhật Ảnh
            if (imageFile != null && !imageFile.isEmpty()) {
                deleteFromR2(existingSong.getImageUrl()); // Xóa trên Cloud
                String relativePath = uploadToR2(imageFile, "images");
                existingSong.setImageUrl(relativePath);
            }

            return songRepository.save(existingSong);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi upload R2");
        }
    }

    @Transactional
    public Song createSong(String title, Long artistId, Long albumId, MultipartFile musicFile, MultipartFile imageFile) {
        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nghệ sĩ không tồn tại"));

        // Kiểm tra file nhạc trước khi lấy duration
        if (musicFile == null || musicFile.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File nhạc không được để trống");
        }

        int duration = FileUtils.getMp3Duration(musicFile);

        try {
            // Upload nhạc lên folder "music"
            String musicPath = uploadToR2(musicFile, "music");

            // Mặc định ảnh
            String imagePath = "images/default-cover.png";
            if (imageFile != null && !imageFile.isEmpty()) {
                imagePath = uploadToR2(imageFile, "images");
            }

            Song song = new Song();
            song.setTitle(title);
            song.setDuration(duration);
            song.setArtist(artist);
            song.setViewCount(0L);
            song.setLikeCount(0);
            song.setFilePath(musicPath); // Lưu music/uuid_name.mp3
            song.setImageUrl(imagePath); // Lưu images/uuid_name.jpg

            if (albumId != null) {
                albumRepository.findById(albumId).ifPresent(song::setAlbum);
            }

            return songRepository.save(song);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi lưu file lên Cloud");
        }
    }

    @Transactional
    public void deleteSong(Long id) {
        Song song = getSong(id);
        deleteFromR2(song.getFilePath());
        deleteFromR2(song.getImageUrl());
        songRepository.delete(song);
    }

    @Transactional(readOnly = true)
    public Song getSong(Long id) {
        return songRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy ID: " + id));
    }

    /**
     * TÌM KIẾM & PHÂN TRANG
     */
    @Transactional(readOnly = true)
    public Page<Song> searchSongs(String title, String albumTitle, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        if (title != null && !title.isBlank()) {
            return songRepository.findByTitleContainingIgnoreCase(title, pageable);
        }
        return songRepository.findAll(pageable);
    }

    @Transactional
    public void incrementViewCount(Long id) {
        int updatedRows = songRepository.incrementViewCount(id);
        if (updatedRows == 0) {
            throw new EntityNotFoundException("Không tìm thấy bài hát để tăng view");
        }
    }

}