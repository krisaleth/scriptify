package com.krisaleth.scriptify.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String nickname;
    private String email;
    private String role;
    private String avatarUrl;
    private Set<Long> favoriteSongIds;
    private List<FavoriteSongShort> favoriteSongs;

    @Data
    @Builder
    public static class FavoriteSongShort {
        private Long id;
        private String title;
        private String imageUrl;
    }
}