package com.krisaleth.scriptify.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistResponse {
    private Long id;
    private String name;
    private String description;
    private String thumbnailUrl;
    private boolean isPublic;
    private Long userId;
    private String userNickname;
    private int songCount;
    private List<SongShortResponse> songs;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SongShortResponse {
        private Long id;
        private String title;
        private String imageUrl;
        private int duration;
        private String artistName;
    }
}