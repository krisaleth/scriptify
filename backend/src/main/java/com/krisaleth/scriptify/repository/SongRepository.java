package com.krisaleth.scriptify.repository;

import com.krisaleth.scriptify.entity.Song;
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
public interface SongRepository extends JpaRepository<Song, Long> {

    // Search by using name
    Page<Song> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    // Search by using album title (FIXED dấu gạch dưới)
    Page<Song> findByAlbum_TitleContainingIgnoreCase(String albumTitle, Pageable pageable);

    // Search by using artist id (FIXED để lấy được cả nhạc Single)
    List<Song> findByArtist_Id(Long artistId);

    // Search by using song name or album name (FIXED lỗi Spring Boot không start được)
    Page<Song> findByTitleContainingIgnoreCaseOrAlbum_TitleContainingIgnoreCase(String title, String albumTitle, Pageable pageable);

    // Top 10 song have most views
    List<Song> findTop10ByOrderByViewCountDesc();

    // Get random song
    @Query(value = "SELECT * FROM songs ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Song> findRandomSongs(@Param("limit") int limit);

    // Add view counter
    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE Song s SET s.viewCount = s.viewCount + 1 WHERE s.id = :id")
    int incrementViewCount(@Param("id") Long id);

    // calc total duration in the album
    @Query("SELECT COALESCE(SUM(s.duration), 0) FROM Song s WHERE s.album.id = :albumId")
    Integer getTotalDurationByAlbumId(@Param("albumId") Long albumId);

    @Query("SELECT s FROM Song s WHERE " +
            "LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.artist.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Song> searchSongs(@Param("keyword") String keyword);
}