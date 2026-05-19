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
public class ArtistResponse {
    private Long id;
    private String name;
    private String bio;
    private String imageUrl;
    private Long totalViews; // Tổng lượt view từ tất cả bài hát
    private Integer songCount; // Số lượng bài hát của nghệ sĩ này
    private List<SongShortResponse> topSongs; // Danh sách bài hát tiêu biểu (nếu cần)

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SongShortResponse {
        private Long id;
        private String title;
        private Long viewCount;
        private String imageUrl;
    }
}