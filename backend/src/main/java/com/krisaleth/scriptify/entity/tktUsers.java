package com.krisaleth.scriptify.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.Accessors;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Getter
@Setter
@Table(name = "tkt_users")
@Accessors(prefix = "tkt")
@AllArgsConstructor
@NoArgsConstructor
public class tktUsers implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tktId;

    @Column(unique = true, nullable = false)
    private String tktNickname;

    @Column(unique = true, nullable = false)
    private String tktEmail;

    @Column(nullable = false)
    @JsonIgnore
    private String tktPassword;

    private boolean tktEnabled;

    @Column(name = "tkt_verification_code")
    @JsonIgnore
    private String tktVerificationCode;

    @Column(name = "tkt_verification_expiration")
    @JsonIgnore
    private LocalDateTime tktVerificationExpiration;

    @Enumerated(EnumType.STRING)
    private tktRole tktRole;

    @Column(name = "tkt_created_at", updatable = false)
    private LocalDateTime tktCreatedAt = LocalDateTime.now();

    @Column(name = "tkt_avatar_url")
    private String tktAvatarUrl = "default-avatar.png";

    @UpdateTimestamp
    @Column(name = "tkt_updated_at")
    private LocalDateTime tktUpdatedAt;

    @OneToMany(mappedBy = "tktUsers")
    @JsonIgnore
    private List<tktPlaylist> tktPlaylists = new ArrayList<>();

    @ManyToMany
    @JsonIgnoreProperties
    @JoinTable(
            name = "tkt_user_favourites",
            joinColumns = @JoinColumn(name = "tkt_user_id"),
            inverseJoinColumns = @JoinColumn(name = "tkt_song_id")
    )
    private Set<tktSong> tktFavoriteSongs = new HashSet<>();

    public tktUsers(String nickname, String email, String password) {
        this.tktNickname = nickname;
        this.tktEmail = email;
        this.tktPassword = password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        tktRole resolvedRole = this.tktRole == null ? tktRole.USER : this.tktRole;
        return List.of(new SimpleGrantedAuthority("ROLE_" + resolvedRole.name()));
    }

    @JsonIgnore
    @Override
    public String getUsername() {
        return this.tktEmail;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return tktEnabled;
    }

    public boolean getEnabled() {
        return tktEnabled;
    }

    @Override
    public String getPassword() {
        return this.tktPassword;
    }
}