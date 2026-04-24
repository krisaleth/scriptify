package com.krisaleth.scriptify.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "songs")
@Getter @Setter
public class Song {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private int duration;

    @Column(nullable = false)
    private String filePath;

    private String imageUrl = "default-cover.png";

    private Long viewCount = 0L;

    @Column(name = "like_count")
    private Integer likeCount = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", nullable = false)
    @JsonIgnoreProperties({"songs", "albums"}) // Cực kỳ quan trọng để cắt đứt vòng lặp
    private Artist artist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id")
    @JsonIgnoreProperties("songs") // Chặn Album liệt kê lại danh sách Song
    private Album album;

    @ManyToMany(mappedBy = "songs")
    @JsonIgnoreProperties("songs")
    private Set<Playlist> playlists;
}