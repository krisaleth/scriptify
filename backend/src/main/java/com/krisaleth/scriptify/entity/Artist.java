package com.krisaleth.scriptify.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "artists")
@Getter
@Setter
public class Artist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String imageUrl;

    @OneToMany(mappedBy = "artist")
    @JsonIgnore
    private List<Album> albums;

    @OneToMany(mappedBy = "artist")
    @JsonIgnore
    private List<Song> songs;
}
