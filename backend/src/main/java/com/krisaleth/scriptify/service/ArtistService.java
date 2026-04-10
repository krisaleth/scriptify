package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.entity.Artist;
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
public class ArtistService {
    private final ArtistRepository artistRepository;

    @Value("${app.upload.image-dir}")
    private String imageDir;

    // --- HÀM HỖ TRỢ LƯU FILE ---
    private String saveImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return "default-artist.png";

        Path uploadPath = Paths.get(imageDir);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path targetPath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        return fileName;
    }

    private void deletePhysicalFile(String dbPath) {
        // Tránh xóa ảnh mặc định của hệ thống
        if (dbPath != null && !dbPath.contains("default-artist.png") && !dbPath.contains("default.png")) {
            try {
                // Bóc tách tên file từ đường dẫn lưu trong DB (ví dụ: /uploads/images/abc.jpg)
                Path path = Paths.get(dbPath);
                String fileName = path.getFileName().toString();
                Files.deleteIfExists(Paths.get(imageDir).resolve(fileName));
            } catch (IOException e) {
                System.err.println("Lỗi xóa file ảnh nghệ sĩ: " + dbPath);
            }
        }
    }

    // --- CÁC PHƯƠNG THỨC CHÍNH ---

    @Transactional
    public Artist create(String name, String bio, MultipartFile imageFile) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên nghệ sĩ không được để trống");
        }

        try {
            String savedFileName = saveImage(imageFile);
            Artist artist = new Artist();
            artist.setName(name.trim());
            artist.setBio(bio != null ? bio.trim() : "");
            // LƯU PATH ĐỒNG BỘ: /uploads/images/filename
            artist.setImageUrl("/uploads/images/" + savedFileName);

            return artistRepository.save(artist);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lưu ảnh nghệ sĩ");
        }
    }

    @Transactional
    public Artist update(Long id, String name, String bio, MultipartFile imageFile) {
        Artist existing = getById(id);

        if (name != null && !name.isBlank()) existing.setName(name.trim());
        if (bio != null) existing.setBio(bio.trim());

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                // Dọn dẹp ảnh cũ trước khi thay ảnh mới
                deletePhysicalFile(existing.getImageUrl());
                String savedFileName = saveImage(imageFile);
                existing.setImageUrl("/uploads/images/" + savedFileName);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi cập nhật ảnh");
            }
        }
        return artistRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Artist artist = getById(id);
        try {
            // Lưu path ảnh trước khi xóa bản ghi trong DB
            String imageUrl = artist.getImageUrl();
            artistRepository.delete(artist);
            // Xóa bản ghi thành công thì mới xóa file vật lý
            deletePhysicalFile(imageUrl);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể xóa nghệ sĩ này vì họ vẫn còn Album hoặc Bài hát gắn liền. Hãy xóa dữ liệu liên quan trước nhé bồ!"
            );
        }
    }

    @Transactional(readOnly = true)
    public Page<Artist> search(String name, int page, int size) {
        // Sắp xếp theo ID giảm dần để nghệ sĩ mới nhất hiện lên đầu danh sách Admin
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        if (name == null || name.isBlank()) {
            return artistRepository.findAll(pageable);
        }
        return artistRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    @Transactional(readOnly = true)
    public Artist getById(Long id) {
        return artistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nghệ sĩ ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<Artist> getAllArtistsList() {
        return artistRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));
    }
}