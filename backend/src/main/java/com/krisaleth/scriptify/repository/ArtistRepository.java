package com.krisaleth.scriptify.repository;

import com.krisaleth.scriptify.entity.Artist;
import com.krisaleth.scriptify.projection.ArtistProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, Long> {
    // Search artist by name
    Page<Artist> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // Check artist name existed
    boolean existsByNameIgnoreCase(String name);

    // Get artist with most album
    @Query("select a from Artist a ORDER BY size(a.albums) DESC")
    List<Artist> findPopularArtist(Pageable pageable);

    // Get the newest artist
    List<Artist> findTop10ByOrderByIdDesc();

    // Get ramdom artist
    @Query(value = "select * from Artist order by rand() limit :limit", nativeQuery = true)
    List<Artist> findRandomArtist(@Param("limit") int limit);


    @Query("SELECT DISTINCT a FROM Artist a LEFT JOIN FETCH a.songs")
    List<Artist> findAllWithSongsFetch();
}
