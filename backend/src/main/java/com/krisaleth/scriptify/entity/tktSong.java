package com.krisaleth.scriptify.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "tkt_songs")
@Accessors(prefix = "tkt")
@Getter
@Setter
public class tktSong {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tktId;

    @Column(nullable = false)
    private String tktTitle;

    @Column(columnDefinition = "TEXT")
    private String tktDescription;

    private int tktDuration;

    @Column(nullable = false)
    private String tktFilePath;

    private String tktImageUrl = "default-cover.png";

    private Long tktViewCount = 0L;

    @Column(name = "tkt_like_count")
    private Integer tktLikeCount = 0;

    @CreationTimestamp
    private LocalDateTime tktCreatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tkt_artist_id", nullable = false)
    @JsonIgnoreProperties({"tktSongs", "tktAlbums", "hibernateLazyInitializer", "handler"})
    private tktArtist tktArtist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tkt_album_id")
    @JsonIgnoreProperties({"tktSongs", "hibernateLazyInitializer", "handler"})
    private tktAlbum tktAlbum;

    @ManyToMany(mappedBy = "tktSongs")
    @JsonIgnoreProperties({"tktSongs", "hibernateLazyInitializer", "handler"})
    private Set<tktPlaylist> tktPlaylists;
}