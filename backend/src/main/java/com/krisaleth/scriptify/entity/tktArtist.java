package com.krisaleth.scriptify.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

import java.util.List;

@Entity
@Table(name = "tkt_artists")
@Getter
@Setter
@Accessors(prefix = "tkt")
public class tktArtist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tktId;

    @Column(nullable = false)
    private String tktName;

    @Column(columnDefinition = "TEXT")
    private String tktBio;

    private String tktImageUrl;

    @OneToMany(mappedBy = "tktArtist")
    @JsonIgnore
    private List<tktAlbum> tktAlbums;

    @OneToMany(mappedBy = "tktArtist")
    @JsonIgnore
    private List<tktSong> tktSongs;
}
