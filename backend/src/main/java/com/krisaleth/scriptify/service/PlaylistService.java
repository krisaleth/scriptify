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
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PlaylistService {
    private final PlaylistRepository playlistRepository;
    private final SongRepository songRepository;

    @Transactional(readOnly = true)
    public List<Playlist> listMyPlaylists(Users user) {
        if (user == null || user.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "user is required");
        }
        Long userId = user.getId();
        return playlistRepository.findAll().stream()
                .filter(p -> p.getUser() != null && p.getUser().getId() != null && p.getUser().getId().equals(userId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Playlist> listPublicPlaylists() {
        return playlistRepository.findAll().stream()
                .filter(Playlist::getIsPublic)
                .toList();
    }

    @Transactional(readOnly = true)
    public Playlist getForOwner(Long playlistId, Users user) {
        if (playlistId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "playlistId is required");
        }
        if (user == null || user.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Playlist not found"));

        if (playlist.getUser() == null || playlist.getUser().getId() == null || !playlist.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't own this playlist");
        }
        return playlist;
    }

    @Transactional
    public Playlist create(PlaylistCreateDto dto, Users user) {
        if (dto == null || dto.getName() == null || dto.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name is required");
        }
        if (user == null || user.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        Playlist playlist = new Playlist();
        playlist.setName(dto.getName());
        playlist.setDescription(dto.getDescription());
        playlist.setThumbnailUrl(dto.getThumbnailUrl());
        playlist.setUser(user);
        playlist.setIsPublic(dto.getIsPublic() == null ? true : dto.getIsPublic());
        playlist.setSongs(dto.getSongIds() == null ? new HashSet<>() : new HashSet<>());

        if (dto.getSongIds() != null && !dto.getSongIds().isEmpty()) {
            addSongsInternal(playlist, dto.getSongIds());
        }

        return playlistRepository.save(playlist);
    }

    @Transactional
    public Playlist update(Long playlistId, PlaylistUpdateDto dto, Users user) {
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "payload is required");
        }
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
        playlistRepository.deleteById(playlist.getId());
    }

    @Transactional
    public Playlist addSongs(Long playlistId, Users user, List<Long> songIds) {
        if (songIds == null || songIds.isEmpty()) {
            return getForOwner(playlistId, user);
        }
        Playlist playlist = getForOwner(playlistId, user);
        addSongsInternal(playlist, songIds);
        return playlistRepository.save(playlist);
    }

    @Transactional
    public Playlist addSong(Long playlistId, Users user, Long songId) {
        if (songId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "songId is required");
        }
        return addSongs(playlistId, user, Collections.singletonList(songId));
    }

    @Transactional
    public Playlist removeSong(Long playlistId, Users user, Long songId) {
        if (songId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "songId is required");
        }
        Playlist playlist = getForOwner(playlistId, user);

        if (playlist.getSongs() == null) {
            playlist.setSongs(new HashSet<>());
        }

        // Ensure song exists (to distinguish "does not exist" from "not in playlist")
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found"));

        playlist.getSongs().remove(song);
        return playlistRepository.save(playlist);
    }

    private void addSongsInternal(Playlist playlist, List<Long> songIds) {
        if (playlist.getSongs() == null) {
            playlist.setSongs(new HashSet<>());
        }

        Set<Long> uniqueIds = new HashSet<>(songIds);
        if (uniqueIds.isEmpty()) {
            return;
        }

        List<Song> foundSongs = songRepository.findAllById(uniqueIds);
        if (foundSongs.size() != uniqueIds.size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more songs not found");
        }

        playlist.getSongs().addAll(foundSongs);
    }
}

