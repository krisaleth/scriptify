package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.dto.PlaylistCreateDto;
import com.krisaleth.scriptify.dto.PlaylistUpdateDto;
import com.krisaleth.scriptify.entity.Playlist;
import com.krisaleth.scriptify.entity.Song;
import com.krisaleth.scriptify.entity.Users;
import com.krisaleth.scriptify.repository.PlaylistRepository;
import com.krisaleth.scriptify.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaylistService {
    private final PlaylistRepository playlistRepository;
    private final SongRepository songRepository;

    // QUY TẮC NGHIỆP VỤ (Business Rule)
    private static final int MAX_SONGS_PER_PLAYLIST = 200;

    @Transactional(readOnly = true)
    public List<Playlist> listMyPlaylists(Users user) {
        if (user == null || user.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return playlistRepository.findByUser_Id(user.getId());
    }

    @Transactional(readOnly = true)
    public List<Playlist> listPublicPlaylists() {
        return playlistRepository.findByIsPublicTrue();
    }

    // TỐI ƯU HÓA: Dùng thẳng Query chọc DB để chống Hack IDOR
    @Transactional(readOnly = true)
    public Playlist getForOwner(Long playlistId, Users user) {
        if (playlistId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "playlistId is required");
        }
        if (user == null || user.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        return playlistRepository.findByIdAndUser_Id(playlistId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Playlist not found or you don't own it"));
    }

    @Transactional
    public Playlist create(PlaylistCreateDto dto, Users user) {
        if (dto == null || dto.getName() == null || dto.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Playlist name is required");
        }

        Playlist playlist = new Playlist();
        playlist.setName(dto.getName());
        playlist.setDescription(dto.getDescription());
        playlist.setThumbnailUrl(dto.getThumbnailUrl());
        playlist.setUser(user);
        playlist.setIsPublic(dto.getIsPublic() == null ? true : dto.getIsPublic());
        playlist.setSongs(new HashSet<>()); // Khởi tạo danh sách rỗng an toàn

        // Lưu trước để có ID
        playlist = playlistRepository.save(playlist);

        if (dto.getSongIds() != null && !dto.getSongIds().isEmpty()) {
            addSongsInternal(playlist, dto.getSongIds());
            playlist = playlistRepository.save(playlist);
        }

        return playlist;
    }

    @Transactional
    public Playlist update(Long playlistId, PlaylistUpdateDto dto, Users user) {
        Playlist playlist = getForOwner(playlistId, user);

        if (dto.getName() != null && !dto.getName().isBlank()) {
            playlist.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            playlist.setDescription(dto.getDescription());
        }
        if (dto.getThumbnailUrl() != null) {
            playlist.setThumbnailUrl(dto.getThumbnailUrl());
        }
        if (dto.getIsPublic() != null) {
            playlist.setIsPublic(dto.getIsPublic());
        }

        return playlistRepository.save(playlist);
    }

    @Transactional
    public void delete(Long playlistId, Users user) {
        Playlist playlist = getForOwner(playlistId, user);
        playlistRepository.delete(playlist);
    }

    @Transactional
    public Playlist addSong(Long playlistId, Users user, Long songId) {
        if (songId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "songId is required");
        }

        Playlist playlist = getForOwner(playlistId, user);

        // KIỂM TRA 1: Bài hát đã có chưa? (Khớp Test Case DT_06)
        if (playlistRepository.isSongInPlaylist(playlistId, songId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bài hát đã có sẵn trong Playlist này");
        }

        // KIỂM TRA 2: Vượt quá giới hạn chưa? (Khớp Test Case DT_07)
        int currentCount = playlistRepository.countSongsInPlaylist(playlistId);
        if (currentCount >= MAX_SONGS_PER_PLAYLIST) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Playlist đã đầy (Tối đa " + MAX_SONGS_PER_PLAYLIST + " bài)");
        }

        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found"));

        playlist.getSongs().add(song);
        return playlistRepository.save(playlist);
    }

    @Transactional
    public Playlist addSongs(Long playlistId, Users user, List<Long> songIds) {
        if (songIds == null || songIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "songIds list cannot be empty");
        }
        Playlist playlist = getForOwner(playlistId, user);
        addSongsInternal(playlist, songIds);
        return playlistRepository.save(playlist);
    }

    @Transactional
    public Playlist removeSong(Long playlistId, Users user, Long songId) {
        if (songId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "songId is required");
        }
        Playlist playlist = getForOwner(playlistId, user);

        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found"));

        // Nếu bài hát không có trong playlist thì báo lỗi nhẹ
        if (!playlist.getSongs().contains(song)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bài hát không tồn tại trong Playlist này");
        }

        playlist.getSongs().remove(song);
        return playlistRepository.save(playlist);
    }

    // Hàm nội bộ hỗ trợ thêm nhiều bài cùng lúc (Dùng lúc khởi tạo Playlist)
    private void addSongsInternal(Playlist playlist, List<Long> songIds) {
        List<Long> uniqueIds = songIds.stream().distinct().toList();

        // Kiểm tra dung lượng an toàn trước khi thêm
        int currentCount = playlist.getId() != null ? playlistRepository.countSongsInPlaylist(playlist.getId()) : 0;
        if (currentCount + uniqueIds.size() > MAX_SONGS_PER_PLAYLIST) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT, "Playlist đã đầy (Tối đa " + MAX_SONGS_PER_PLAYLIST + " bài)");
        }

        List<Song> foundSongs = songRepository.findAllById(uniqueIds);
        if (foundSongs.size() != uniqueIds.size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Phát hiện bài hát không hợp lệ trong danh sách");
        }

        playlist.getSongs().addAll(foundSongs);
    }
}