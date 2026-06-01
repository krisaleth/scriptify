package com.krisaleth.scriptify.repository;

import com.krisaleth.scriptify.entity.tktPlaylist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistRepository extends JpaRepository<tktPlaylist, Long> {

    @EntityGraph(attributePaths = {"tktUsers"})
    tktPlaylist findByTktId(Long id);

    List<tktPlaylist> findByTktUsers_TktId(Long userId);

    Page<tktPlaylist> findByTktIsPublicTrue(Pageable pageable);

    Page<tktPlaylist> findByTktNameContainingIgnoreCaseAndTktIsPublicTrue(String name, Pageable pageable);

    Optional<tktPlaylist> findByTktIdAndTktUsers_TktId(Long id, Long userId);

    boolean existsByTktIdAndTktUsers_TktId(Long id, Long userId);

    @Query("SELECT SIZE(p.tktSongs) FROM tktPlaylist p WHERE p.tktId = :playlistId")
    int countSongsInPlaylist(@Param("playlistId") Long playlistId);

    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END " +
            "FROM tktPlaylist p JOIN p.tktSongs s WHERE p.tktId = :playlistId AND s.tktId = :songId")
    boolean isSongInPlaylist(@Param("playlistId") Long playlistId, @Param("songId") Long songId);

    List<tktPlaylist> findTop5ByTktIsPublicTrueOrderByTktCreatedAtDesc();

    List<tktPlaylist> findByTktSongs_TktId(Long songId);
}