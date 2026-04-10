package com.krisaleth.scriptify.service;


import com.krisaleth.scriptify.entity.Artist;
import com.krisaleth.scriptify.entity.Song;
import com.krisaleth.scriptify.repository.AlbumRepository;
import com.krisaleth.scriptify.repository.ArtistRepository;
import com.krisaleth.scriptify.repository.SongRepository;
import com.krisaleth.scriptify.config.FileUtils;
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

import java.io.IOException;
import java.net.MalformedURLException;
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
    private final ArtistRepository artistRepository;

    @Value("${app.upload.music-dir}")
    private String musicDir;

    @Value("${app.upload.image-dir}")
    private String imageDir;

    /**
     * HÀM LƯU FILE VẬT LÝ
     */
    private String savePhysicalFile(MultipartFile file, String uploadDir) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path targetPath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    /**
     * HÀM XÓA FILE VẬT LÝ (Tự bóc tách tên file từ path DB)
     */
    private void deletePhysicalFile(String dir, String dbPath) {
        if (dbPath != null && !dbPath.contains("default-cover.png")) {
            try {
                // Ví dụ: dbPath = "/uploads/music/abc.mp3" -> getFileName = "abc.mp3"
                String fileName = Paths.get(dbPath).getFileName().toString();
                Files.deleteIfExists(Paths.get(dir).resolve(fileName));
            } catch (IOException e) {
                System.err.println("Lỗi xóa file: " + dbPath);
            }
        }
    }

    @Transactional
    public Song updateSong(Long id, String title, Long artistId, Long albumId, MultipartFile musicFile, MultipartFile imageFile) {
        // 1. Tìm bài hát hiện tại
        Song existingSong = getSong(id);

        // 2. Cập nhật các thông tin cơ bản nếu có truyền vào
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
            // 3. Xử lý cập nhật File Nhạc (.mp3)
            if (musicFile != null && !musicFile.isEmpty()) {
                // Xóa file nhạc cũ vật lý
                deletePhysicalFile(musicDir, existingSong.getFilePath());

                // Lưu file nhạc mới
                String savedMusicName = savePhysicalFile(musicFile, musicDir);
                existingSong.setFilePath("/uploads/music/" + savedMusicName);

                // Cập nhật lại thời lượng bài hát mới
                existingSong.setDuration(FileUtils.getMp3Duration(musicFile));
            }

            // 4. Xử lý cập nhật Ảnh bìa
            if (imageFile != null && !imageFile.isEmpty()) {
                // Xóa ảnh cũ vật lý (nếu không phải ảnh mặc định)
                deletePhysicalFile(imageDir, existingSong.getImageUrl());

                // Lưu ảnh mới
                String savedImageName = savePhysicalFile(imageFile, imageDir);
                existingSong.setImageUrl("/uploads/images/" + savedImageName);
            }

            // 5. Lưu vào Database
            return songRepository.save(existingSong);

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi xảy ra khi cập nhật file hệ thống");
        }
    }

    /**
     * LẤY 1 BÀI HÁT THEO ID
     */
    @Transactional(readOnly = true)
    public Song getSong(Long id) {
        return songRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy ID: " + id));
    }

    /**
     * TẠO MỚI BÀI HÁT
     */
    @Transactional
    public Song createSong(String title, Long artistId, Long albumId, MultipartFile musicFile, MultipartFile imageFile) {
        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nghệ sĩ không tồn tại"));

        int duration = FileUtils.getMp3Duration(musicFile);

        try {
            String savedMusicName = savePhysicalFile(musicFile, musicDir);
            String savedImageName = "default-cover.png";
            boolean isNewImage = false;

            if (imageFile != null && !imageFile.isEmpty()) {
                savedImageName = savePhysicalFile(imageFile, imageDir);
                isNewImage = true;
            }

            Song song = new Song();
            song.setTitle(title);
            song.setDuration(duration);
            song.setArtist(artist);
            song.setViewCount(0L);
            song.setLikeCount(0);

            // LƯU NGUYÊN PATH NHƯ AVATAR USER
            song.setFilePath("/uploads/music/" + savedMusicName);
            song.setImageUrl(isNewImage ? "/uploads/images/" + savedImageName : "/uploads/images/default-cover.png");

            if (albumId != null) {
                albumRepository.findById(albumId).ifPresent(song::setAlbum);
            }

            return songRepository.save(song);

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi lưu file");
        }
    }

    /**
     * XÓA BÀI HÁT
     */
    @Transactional
    public void deleteSong(Long id) {
        Song song = getSong(id);
        deletePhysicalFile(musicDir, song.getFilePath());
        deletePhysicalFile(imageDir, song.getImageUrl());
        songRepository.delete(song);
    }

    /**
     * PHÁT NHẠC (STREAMING)
     */
    public Resource playSong(Long id) {
        Song song = getSong(id);
        try {
            String fileName = Paths.get(song.getFilePath()).getFileName().toString();
            Path path = Paths.get(musicDir).resolve(fileName).normalize();
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists()) return resource;
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File không tồn tại");
        } catch (MalformedURLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi đường dẫn");
        }
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
        songRepository.incrementViewCount(id);
    }

    @Transactional(readOnly = true)
    public List<Song> getAllSongsList() {
        return songRepository.findAll();
    }
}