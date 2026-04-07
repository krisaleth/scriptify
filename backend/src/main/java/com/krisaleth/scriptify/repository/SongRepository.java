package com.krisaleth.scriptify.repository;

import com.krisaleth.scriptify.entity.Song;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {
    // Search by using name
    Page<Song> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    // Search by using album title
    Page<Song> findByAlbum_TitleContainingIgnoreCase(String albumTitle, Pageable pageable);

    // Search by using artist id
    List<Song> findByAlbum_Artist_Id(Long id);

    // Search by using song name or album name
    Page<Song> findByTitleContainingIgnoreCaseOrAlbumTitleContainingIgnoreCase(String title, String albumTitle, Pageable pageable);

    // Top 10 song have most views
    List<Song> findTop10ByOrderByViewCountDesc();

    // Get random song
    @Query(value = "select * from songs order by rand() limit :limit", nativeQuery = true)
    List<Song> findRandomSongs(@Param("limit") int limit);

    // Add view counter
    @Modifying
    @Query("update Song s set s.viewCount = s.viewCount + 1 where s.id = :id")
    void incrementViewCount(@Param("id") Long id);

    // calc total duration in the album
    @Query("select coalesce(sum(s.duration)) from Song s where s.album.id = :albumId")
    Integer getTotalDurationByAlbumId(@Param("albumId") Long albumId);

}
