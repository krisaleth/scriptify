package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.entity.tktArtist;
import com.krisaleth.scriptify.entity.tktPlaylist;
import com.krisaleth.scriptify.entity.tktSong;
import com.krisaleth.scriptify.entity.tktUsers;
import com.krisaleth.scriptify.repository.*;
import com.krisaleth.scriptify.config.FileUtils;
import com.krisaleth.scriptify.response.SongResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
public class SongService {
    private final SongRepository songRepository;
    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;
    private final S3Client s3Client;
    private final UsersRepository usersRepository;
    private final PlaylistRepository playlistRepository;

    @Value("${r2.bucket-name}")
    private String bucketName;

    /**
     * HÀM LƯU FILE LÊN R2 (Thay thế savePhysicalFile)
     */
    private String uploadToR2(MultipartFile file, String folder) throws IOException {

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

        return fileName;
    }

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

    private SongResponse convertToSongResponse(tktSong song) {
        return SongResponse.builder()
                .id(song.getId())
                .title(song.getTitle())
                .duration(song.getDuration())
                .filePath(song.getFilePath())
                .imageUrl(song.getImageUrl())
                .viewCount(song.getViewCount())
                .likeCount(song.getLikeCount())
                .createdAt(song.getCreatedAt())
                .artist(SongResponse.ArtistShortResponse.builder()
                        .id(song.getArtist().getId())
                        .name(song.getArtist().getName())
                        .build())
                .albumTitle(song.getAlbum() != null ? song.getAlbum().getTitle() : null)
                .build();
    }

    public Page<SongResponse> getAllSongs(Pageable pageable) {
        return songRepository.findAll(pageable).map(this::convertToSongResponse);
    }

    public Page<SongResponse> searchSongs(String keyword, Pageable pageable) {
        return songRepository.findByTktTitleContainingIgnoreCaseOrTktAlbum_TktTitleContainingIgnoreCase(keyword, keyword, pageable)
                .map(this::convertToSongResponse);
    }

    @Transactional
    public SongResponse updateSong(Long id, String title, Long artistId, Long albumId, MultipartFile musicFile, MultipartFile imageFile) {
        tktSong existingTktSong = songRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy ID: " + id));

        if (title != null && !title.isBlank()) {
            existingTktSong.setTitle(title);
        }

        if (artistId != null) {
            tktArtist tktArtist = artistRepository.findById(artistId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nghệ sĩ không tồn tại"));
            existingTktSong.setArtist(tktArtist);
        }

        if (albumId != null) {
            albumRepository.findById(albumId).ifPresent(existingTktSong::setAlbum);
        }

        try {
            if (musicFile != null && !musicFile.isEmpty()) {
                deleteFromR2(existingTktSong.getFilePath());
                String relativePath = uploadToR2(musicFile, "music");
                existingTktSong.setFilePath(relativePath);
                existingTktSong.setDuration(FileUtils.getMp3Duration(musicFile));
            }

            if (imageFile != null && !imageFile.isEmpty()) {
                deleteFromR2(existingTktSong.getImageUrl());
                String relativePath = uploadToR2(imageFile, "images");
                existingTktSong.setImageUrl(relativePath);
            }

            return convertToSongResponse(songRepository.save(existingTktSong));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi upload R2");
        }
    }

    @Transactional
    public SongResponse createSong(String title, Long artistId, Long albumId, MultipartFile musicFile, MultipartFile imageFile) {
        tktArtist tktArtist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nghệ sĩ không tồn tại"));

        if (musicFile == null || musicFile.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File nhạc không được để trống");
        }

        int duration = FileUtils.getMp3Duration(musicFile);

        try {
            String musicPath = uploadToR2(musicFile, "music");

            String imagePath = "assets/default-cover.png";
            if (imageFile != null && !imageFile.isEmpty()) {
                imagePath = uploadToR2(imageFile, "images");
            }

            tktSong tktSong = new tktSong();
            tktSong.setTitle(title);
            tktSong.setDuration(duration);
            tktSong.setArtist(tktArtist);
            tktSong.setViewCount(0L);
            tktSong.setLikeCount(0);
            tktSong.setFilePath(musicPath);
            tktSong.setImageUrl(imagePath);

            if (albumId != null) {
                albumRepository.findById(albumId).ifPresent(tktSong::setAlbum);
            }
            return convertToSongResponse(songRepository.save(tktSong));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi lưu file lên Cloud");
        }
    }

    @Transactional
    public void deleteSong(Long id) {
        tktSong tktSong = songRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy ID: " + id));

        List<tktUsers> userFav = usersRepository.findByTktFavoriteSongs_TktId(id);
        for (tktUsers user : userFav) {
            user.getFavoriteSongs().remove(tktSong);
            usersRepository.save(user);
        }
        List<tktPlaylist> playListHaveSong = playlistRepository.findByTktSongs_TktId(id);
        for (tktPlaylist playlist : playListHaveSong) {
            playlist.getSongs().remove(tktSong);
            playlistRepository.save(playlist);
        }

        String musicPath = tktSong.getFilePath();
        String imagePath = tktSong.getImageUrl();
        if (musicPath != null) {
            deleteFromR2(musicPath);
        }

        if (imagePath != null && !imagePath.contains("default-cover.png")) {
            deleteFromR2(imagePath);
        }
        songRepository.delete(tktSong);
    }

    @Transactional(readOnly = true)
    public SongResponse getSong(Long id) {
        return convertToSongResponse(songRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy ID: " + id)));
    }

    @Transactional
    public void incrementViewCount(Long id) {
        int updatedRows = songRepository.incrementViewCount(id);
        if (updatedRows == 0) {
            throw new EntityNotFoundException("Không tìm thấy bài hát để tăng view");
        }
    }


}