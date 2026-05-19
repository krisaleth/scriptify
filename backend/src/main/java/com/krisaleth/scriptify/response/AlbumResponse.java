package com.krisaleth.scriptify.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlbumResponse {
    private Long id;
    private String title;
    private Integer releaseYear;
    private String coverImageUrl;
    private ArtistShortResponse artist;
    private int songCount;
    private List<SongShortResponse> songs;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArtistShortResponse {
        private Long id;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SongShortResponse {
        private Long id;
        private String title;
        private int duration;
        private Long viewCount;
    }
}