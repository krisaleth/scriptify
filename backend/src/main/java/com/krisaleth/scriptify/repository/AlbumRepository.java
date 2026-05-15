package com.krisaleth.scriptify.repository;

import com.krisaleth.scriptify.entity.tktAlbum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlbumRepository extends JpaRepository<tktAlbum, Long> {

    List<tktAlbum> findByTktArtist_TktIdOrderByTktReleaseYearDesc(Long artistId);

    List<tktAlbum> findTop3ByTktArtist_TktIdOrderByTktReleaseYearDesc(Long artistId);

    Page<tktAlbum> findByTktTitleContainingIgnoreCase(String title, Pageable pageable);

    List<tktAlbum> findByTktReleaseYear(Integer releaseYear);

    List<tktAlbum> findByTktReleaseYearBetween(Integer start, Integer end);

    List<tktAlbum> findTop10ByOrderByTktReleaseYearDesc();

    List<tktAlbum> findByTktArtist_TktNameContainingIgnoreCase(String name);

    @Query("SELECT a FROM tktAlbum a JOIN FETCH a.tktArtist WHERE a.tktTitle LIKE %:title%")
    List<tktAlbum> findByTitleWithArtist(@Param("title") String title);
}