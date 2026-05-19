package com.krisaleth.scriptify.repository;

import com.krisaleth.scriptify.entity.tktSong;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<tktSong, Long> {

    Page<tktSong> findByTktTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<tktSong> findByTktAlbum_TktTitleContainingIgnoreCase(String albumTitle, Pageable pageable);

    List<tktSong> findByTktArtist_TktId(Long artistId);

    Page<tktSong> findByTktTitleContainingIgnoreCaseOrTktAlbum_TktTitleContainingIgnoreCase(String title, String albumTitle, Pageable pageable);

    List<tktSong> findTop10ByOrderByTktViewCountDesc();

    @Query(value = "SELECT * FROM tkt_songs ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<tktSong> findRandomSongs(@Param("limit") int limit);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE tktSong s SET s.tktViewCount = s.tktViewCount + 1 WHERE s.tktId = :id")
    int incrementViewCount(@Param("id") Long id);

    @Query("SELECT COALESCE(SUM(s.tktDuration), 0) FROM tktSong s WHERE s.tktAlbum.tktId = :albumId")
    Integer getTotalDurationByAlbumId(@Param("albumId") Long albumId);

    @Query("SELECT s FROM tktSong s WHERE " +
            "LOWER(s.tktTitle) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.tktArtist.tktName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<tktSong> searchSongs(@Param("keyword") String keyword, Pageable pageable);

    Page<tktSong> findByTktTitleContainingIgnoreCaseOrTktArtist_TktNameContainingIgnoreCase(String title, String artistName, Pageable pageable);
}