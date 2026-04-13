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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AlbumService {
    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;

    @Value("${app.upload.image-dir}")
    private String imageDir;

    private String saveImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return "default-album.png";
        Path uploadPath = Paths.get(imageDir);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
        return fileName;
    }

    private void deletePhysicalFile(String dbPath) {
        // Kiểm tra null và tránh xóa ảnh mặc định (default-album.png hoặc default.png)
        if (dbPath != null && !dbPath.toLowerCase().contains("default")) {
            try {
                // Lấy tên file thô: /uploads/images/abc.jpg -> abc.jpg
                Path pathInDb = Paths.get(dbPath);
                String fileName = pathInDb.getFileName().toString();

                // Nối với thư mục gốc trên server để xóa
                Path targetFile = Paths.get(imageDir).resolve(fileName);
                Files.deleteIfExists(targetFile);
                System.out.println("Đã xóa file vật lý: " + targetFile);
            } catch (Exception e) {
                // Chỉ in log chứ không làm dừng chương trình (tránh crash App khi demo)
                System.err.println("Không thể xóa file vật lý tại: " + dbPath + ". Lỗi: " + e.getMessage());
            }
        }
    }

    // --- CÁC PHƯƠNG THỨC CHÍNH ---

    @Transactional
    public Album create(String title, Integer releaseYear, Long artistId, MultipartFile imageFile) {
        if (title == null || title.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tiêu đề Album trống");

        // Luôn gán vào 1 Artist (Nhiều album cùng trỏ về ID này)
        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy Nghệ sĩ"));

        try {
            String savedFileName = saveImage(imageFile);
            Album album = new Album();
            album.setTitle(title);
            album.setReleaseYear(releaseYear);
            album.setArtist(artist);
            album.setCoverImageUrl("/uploads/images/" + savedFileName);
            return albumRepository.save(album);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi lưu file");
        }
    }

    // Lấy tất cả album của một nhạc sĩ cụ thể (Trả về List để hiện Discography)
    @Transactional(readOnly = true)
    public List<Album> findAllByArtistId(Long artistId) {
        if (!artistRepository.existsById(artistId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nghệ sĩ không tồn tại");
        }
        // Gọi repository để tìm list album (Sắp xếp theo năm mới nhất lên đầu)
        return albumRepository.findByArtist_IdOrderByReleaseYearDesc(artistId);
    }

    @Transactional
    public Album update(Long id, String title, Integer releaseYear, Long artistId, MultipartFile imageFile) {
        Album existing = getById(id);
        if (title != null) existing.setTitle(title);
        if (releaseYear != null) existing.setReleaseYear(releaseYear);

        if (artistId != null) {
            Artist artist = artistRepository.findById(artistId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artist not found"));
            existing.setArtist(artist);
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                deletePhysicalFile(existing.getCoverImageUrl());
                String savedFileName = saveImage(imageFile);
                existing.setCoverImageUrl("/uploads/images/" + savedFileName);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi cập nhật ảnh");
            }
        }
        return albumRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Album album = getById(id);
        try {
            deletePhysicalFile(album.getCoverImageUrl());
            albumRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Album đang có bài hát, không thể xóa!");
        }
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
}