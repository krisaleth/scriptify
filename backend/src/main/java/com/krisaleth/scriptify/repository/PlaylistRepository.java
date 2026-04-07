package com.krisaleth.scriptify.repository;

import com.krisaleth.scriptify.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    List<Playlist> findByUser_Id(Long userId);

    List<Playlist> findByIsPublicTrue();
}
