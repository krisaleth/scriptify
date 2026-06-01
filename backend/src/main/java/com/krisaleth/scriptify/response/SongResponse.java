package com.krisaleth.scriptify.response;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SongResponse {
    private Long id;
    private String title;
    private int duration;
    private String description;
    private String filePath;
    private String imageUrl;
    private Long viewCount;
    private Integer likeCount;
    private LocalDateTime createdAt;
    private ArtistShortResponse artist;
    private String albumTitle;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArtistShortResponse {
        private Long id;
        private String name;
    }
}