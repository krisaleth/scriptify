package com.krisaleth.scriptify.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "playlists")
@Getter
@Setter
@Accessors(prefix = "tkt")
public class tktPlaylist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tktId;

    @Column(nullable = false)
    private String tktName;

    @Column(columnDefinition = "TEXT")
    private String tktDescription;

    private String tktThumbnailUrl;

    private boolean tktIsPublic = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tkt_user_id")
    private tktUsers tktUsers;

    @CreationTimestamp
    private LocalDateTime tktCreatedAt;

    @UpdateTimestamp
    private LocalDateTime tktUpdatedAt;

    @ManyToMany
    @JoinTable(
            name = "tkt_playlist_songs",
            joinColumns = @JoinColumn(name = "tkt_playlist_id"),
            inverseJoinColumns = @JoinColumn(name = "tkt_song_id")
    )
    private Set<tktSong> tktSongs;

    // Explicit accessors to avoid ambiguity with Lombok naming for boolean fields prefixed by "is".
    public boolean getIsPublic() {
        return tktIsPublic;
    }

    public void setIsPublic(boolean isPublic) {
        this.tktIsPublic = isPublic;
    }
}
