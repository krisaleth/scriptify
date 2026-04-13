package com.krisaleth.scriptify.repository;

import com.krisaleth.scriptify.entity.Album;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {
    // Album from artist
    List<Album> findByArtist_IdOrderByReleaseYearDesc(Long artistId);

    // New album from artist
    List<Album> findTop3ByArtist_IdOrderByReleaseYearDesc(Long artistId);

    // Search by name
    Page<Album> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    // Find all album in a year
    List<Album> findByReleaseYear(Integer releaseYear);

    // Find all album in a gap between 2 years
    List<Album> findByReleaseYearBetween(Integer releaseYearStart, Integer releaseYearEnd);

    // Top 10 newest albums
    List<Album> findTop10ByOrderByReleaseYearDesc();

    // Search album by artist name
    List<Album> findByArtist_NameContainingIgnoreCase(String name);

    @Query("SELECT a FROM Album a JOIN FETCH a.artist WHERE a.title LIKE %:title%")
    List<Album> findByTitleWithArtist(@Param("title") String title);
}
