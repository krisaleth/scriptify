package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.dto.PlaylistCreateDto;
import com.krisaleth.scriptify.dto.PlaylistUpdateDto;
import com.krisaleth.scriptify.entity.Playlist;
import com.krisaleth.scriptify.entity.Song;
import com.krisaleth.scriptify.entity.Users;
import com.krisaleth.scriptify.repository.PlaylistRepository;
import com.krisaleth.scriptify.repository.SongRepository;
import lombok.RequiredArgsConstructor;
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
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlaylistService {
    private final PlaylistRepository playlistRepository;
    private final SongRepository songRepository;
    private final S3Client s3Client; // ✅ Thêm để upload R2

    @Value("${r2.bucket-name}")
    private String bucketName;

    private static final int MAX_SONGS_PER_PLAYLIST = 200;

    // --- QUERIES ---

    @Transactional(readOnly = true)
    public List<Playlist> listMyPlaylists(Users user) {
        if (user == null || user.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Yêu cầu đăng nhập");
        }
        return playlistRepository.findByUser_Id(user.getId());
    }

    @Transactional(readOnly = true)
    public Page<Playlist> listPublicPlaylists(Pageable pageable) {
        return playlistRepository.findByIsPublicTrue(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Playlist> searchPublicPlaylists(String query, Pageable pageable) {
        return playlistRepository.findByNameContainingIgnoreCaseAndIsPublicTrue(query, pageable);
    }

    @Transactional(readOnly = true)
    public Playlist getForOwner(Long playlistId, Users user) {
        return playlistRepository.findByIdAndUser_Id(playlistId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền truy cập playlist này"));
    }

    // --- ACTIONS ---

    @Transactional
    public Playlist create(PlaylistCreateDto dto, Users user) {
        Playlist playlist = new Playlist();
        playlist.setName(dto.getName());
        playlist.setDescription(dto.getDescription());
        playlist.setUser(user);
        playlist.setIsPublic(dto.getIsPublic() != null ? dto.getIsPublic() : true);
        playlist.setSongs(new HashSet<>());

        // ✅ XỬ LÝ UPLOAD THUMBNAIL (Sửa lỗi getThumbnailUrl)
        if (dto.getThumbnail() != null && !dto.getThumbnail().isEmpty()) {
            try {
                String path = uploadToR2(dto.getThumbnail());
                playlist.setThumbnailUrl(path);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi upload ảnh bìa lên R2");
            }
        } else {
            playlist.setThumbnailUrl("assets/default-playlist.png");
        }

        playlist = playlistRepository.save(playlist);

        if (dto.getSongIds() != null && !dto.getSongIds().isEmpty()) {
            addSongsInternal(playlist, dto.getSongIds());
            return playlistRepository.save(playlist);
        }
        return playlist;
    }

    @Transactional
    public Playlist update(Long playlistId, PlaylistUpdateDto dto, Users user) {
        Playlist playlist = getForOwner(playlistId, user);

        if (dto.getName() != null) playlist.setName(dto.getName());
        if (dto.getDescription() != null) playlist.setDescription(dto.getDescription());
        if (dto.getIsPublic() != null) playlist.setIsPublic(dto.getIsPublic());

        // ✅ XỬ LÝ ĐỔI THUMBNAIL
        if (dto.getThumbnail() != null && !dto.getThumbnail().isEmpty()) {
            try {
                // Xóa ảnh cũ trên R2 để tiết kiệm dung lượng
                deleteFromR2(playlist.getThumbnailUrl());
                // Upload ảnh mới
                String path = uploadToR2(dto.getThumbnail());
                playlist.setThumbnailUrl(path);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi cập nhật ảnh bìa");
            }
        }

        return playlistRepository.save(playlist);
    }

    @Transactional
    public void delete(Long playlistId, Users user) {
        Playlist playlist = getForOwner(playlistId, user);
        deleteFromR2(playlist.getThumbnailUrl()); // Xóa ảnh trên R2 khi xóa playlist
        playlistRepository.delete(playlist);
    }

    // --- SONG MANAGEMENT ---

    @Transactional
    public Playlist addSong(Long playlistId, Users user, Long songId) {
        Playlist playlist = getForOwner(playlistId, user);
        if (playlistRepository.isSongInPlaylist(playlistId, songId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bài hát đã có trong Playlist");
        }
        if (playlistRepository.countSongsInPlaylist(playlistId) >= MAX_SONGS_PER_PLAYLIST) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Playlist đầy");
        }

        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài hát"));

        playlist.getSongs().add(song);
        return playlistRepository.save(playlist);
    }

    @Transactional
    public Playlist removeSong(Long playlistId, Users user, Long songId) {
        Playlist playlist = getForOwner(playlistId, user);
        if (!playlistRepository.isSongInPlaylist(playlistId, songId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Bài hát không có trong playlist");
        }
        Song song = songRepository.findById(songId).orElseThrow();
        playlist.getSongs().remove(song);
        return playlistRepository.save(playlist);
    }

    // --- HELPERS ---

    private void addSongsInternal(Playlist playlist, List<Long> songIds) {
        List<Long> uniqueIds = songIds.stream().distinct().toList();
        int currentCount = playlist.getId() != null ? playlistRepository.countSongsInPlaylist(playlist.getId()) : 0;
        if (currentCount + uniqueIds.size() > MAX_SONGS_PER_PLAYLIST) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT, "Vượt quá giới hạn bài hát");
        }
        List<Song> foundSongs = songRepository.findAllById(uniqueIds);
        playlist.getSongs().addAll(foundSongs);
    }

    private String uploadToR2(MultipartFile file) throws IOException {
        String fileName = "playlists/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();
        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
        return fileName;
    }

    private void deleteFromR2(String relativePath) {
        if (relativePath == null || relativePath.startsWith("assets/")) return;
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(relativePath).build());
        } catch (Exception e) {
            System.err.println("Lỗi xóa file R2: " + relativePath);
        }
    }
}