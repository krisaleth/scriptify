package com.krisaleth.scriptify.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

import java.util.List;

@Entity
@Table(name = "tkt_albums")
@Getter
@Setter
@Accessors(prefix = "tkt")
public class tktAlbum {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tktId;
    private String tktTitle;
    private Integer tktReleaseYear;
    private String tktCoverImageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tkt_artist_id")
    @JsonIgnoreProperties("tktAlbum")
    private tktArtist tktArtist;

    @OneToMany(mappedBy = "tktAlbum")
    @JsonIgnore
    private List<tktSong> tktSongs;
}
