package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.dto.PlaylistCreateDto;
import com.krisaleth.scriptify.dto.PlaylistUpdateDto;
import com.krisaleth.scriptify.entity.tktPlaylist;
import com.krisaleth.scriptify.entity.tktSong;
import com.krisaleth.scriptify.entity.tktUsers;
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
    private final S3Client s3Client;

    @Value("${r2.bucket-name}")
    private String bucketName;

    private static final int MAX_SONGS_PER_PLAYLIST = 200;

    @Transactional(readOnly = true)
    public List<tktPlaylist> listMyPlaylists(tktUsers user) {
        if (user == null || user.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Yêu cầu đăng nhập");
        }
        return playlistRepository.findByTktUsers_TktId(user.getId());
    }

    @Transactional(readOnly = true)
    public Page<tktPlaylist> listPublicPlaylists(Pageable pageable) {
        return playlistRepository.findByTktIsPublicTrue(pageable);
    }

    @Transactional(readOnly = true)
    public Page<tktPlaylist> searchPublicPlaylists(String query, Pageable pageable) {
        return playlistRepository.findByTktNameContainingIgnoreCaseAndTktIsPublicTrue(query, pageable);
    }

    @Transactional(readOnly = true)
    public tktPlaylist getForOwner(Long playlistId, tktUsers user) {
        return playlistRepository.findByTktIdAndTktUsers_TktId(playlistId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền truy cập playlist này"));
    }

    @Transactional
    public tktPlaylist create(PlaylistCreateDto dto, tktUsers user) {
        tktPlaylist playlist = new tktPlaylist();
        playlist.setName(dto.getName());
        playlist.setDescription(dto.getDescription());
        playlist.setUsers(user);
        playlist.setIsPublic(dto.getIsPublic() != null ? dto.getIsPublic() : true);
        playlist.setSongs(new HashSet<>());

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
    public tktPlaylist update(Long playlistId, PlaylistUpdateDto dto, tktUsers user) {
        tktPlaylist playlist = getForOwner(playlistId, user);

        if (dto.getName() != null) playlist.setName(dto.getName());
        if (dto.getDescription() != null) playlist.setDescription(dto.getDescription());
        if (dto.getIsPublic() != null) playlist.setIsPublic(dto.getIsPublic());

        if (dto.getThumbnail() != null && !dto.getThumbnail().isEmpty()) {
            try {
                deleteFromR2(playlist.getThumbnailUrl());
                String path = uploadToR2(dto.getThumbnail());
                playlist.setThumbnailUrl(path);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi cập nhật ảnh bìa");
            }
        }

        return playlistRepository.save(playlist);
    }

    @Transactional
    public void delete(Long playlistId, tktUsers user) {
        tktPlaylist playlist = getForOwner(playlistId, user);
        deleteFromR2(playlist.getThumbnailUrl());
        playlistRepository.delete(playlist);
    }

    @Transactional
    public tktPlaylist addSong(Long playlistId, tktUsers user, Long songId) {
        tktPlaylist playlist = getForOwner(playlistId, user);
        if (playlistRepository.isSongInPlaylist(playlistId, songId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bài hát đã có trong Playlist");
        }
        if (playlistRepository.countSongsInPlaylist(playlistId) >= MAX_SONGS_PER_PLAYLIST) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Playlist đầy");
        }

        tktSong song = songRepository.findById(songId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài hát"));

        playlist.getSongs().add(song);
        return playlistRepository.save(playlist);
    }

    @Transactional
    public tktPlaylist removeSong(Long playlistId, tktUsers user, Long songId) {
        tktPlaylist playlist = getForOwner(playlistId, user);
        if (!playlistRepository.isSongInPlaylist(playlistId, songId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Bài hát không có trong playlist");
        }
        tktSong song = songRepository.findById(songId).orElseThrow();
        playlist.getSongs().remove(song);
        return playlistRepository.save(playlist);
    }

    private void addSongsInternal(tktPlaylist playlist, List<Long> songIds) {
        List<Long> uniqueIds = songIds.stream().distinct().toList();
        int currentCount = playlist.getId() != null ? playlistRepository.countSongsInPlaylist(playlist.getId()) : 0;
        if (currentCount + uniqueIds.size() > MAX_SONGS_PER_PLAYLIST) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT, "Vượt quá giới hạn bài hát");
        }
        List<tktSong> songs = songRepository.findAllById(uniqueIds);
        playlist.getSongs().addAll(songs);
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