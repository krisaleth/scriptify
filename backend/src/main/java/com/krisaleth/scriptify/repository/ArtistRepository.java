package com.krisaleth.scriptify.repository;

import com.krisaleth.scriptify.entity.tktArtist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtistRepository extends JpaRepository<tktArtist, Long> {

    Page<tktArtist> findByTktNameContainingIgnoreCase(String name, Pageable pageable);

    boolean existsByTktNameIgnoreCase(String name);

    @Query("SELECT a FROM tktArtist a ORDER BY size(a.tktAlbums) DESC")
    List<tktArtist> findPopularArtist(Pageable pageable);

    List<tktArtist> findTop10ByOrderByTktIdDesc();

    @Query(value = "SELECT * FROM tkt_artists ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<tktArtist> findRandomArtist(@Param("limit") int limit);

    @Query("SELECT DISTINCT a FROM tktArtist a LEFT JOIN FETCH a.tktSongs")
    List<tktArtist> findAllWithSongsFetch();
}