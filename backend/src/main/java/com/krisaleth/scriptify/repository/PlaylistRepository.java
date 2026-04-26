package com.krisaleth.scriptify.repository;

import com.krisaleth.scriptify.entity.Playlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    // 1. Lấy playlist của User (Dùng EntityGraph để lấy luôn thông tin User trong 1 câu query)
    @EntityGraph(attributePaths = {"user"})
    List<Playlist> findByUser_Id(Long userId);

    // 2. Lấy playlist công khai (Có phân trang để app mượt hơn)
    Page<Playlist> findByIsPublicTrue(Pageable pageable);

    // 3. Tìm kiếm Playlist công khai theo tên (Dành cho tính năng Search)
    Page<Playlist> findByNameContainingIgnoreCaseAndIsPublicTrue(String name, Pageable pageable);

    // 4. Chống hack IDOR (Sếp giữ cái này là rất chuẩn)
    Optional<Playlist> findByIdAndUser_Id(Long id, Long userId);

    // 5. Kiểm tra quyền sở hữu nhanh (Dùng cho các logic validate đơn giản)
    boolean existsByIdAndUser_Id(Long id, Long userId);

    // 6. Đếm bài hát (Tối ưu query)
    @Query("SELECT SIZE(p.songs) FROM Playlist p WHERE p.id = :playlistId")
    int countSongsInPlaylist(@Param("playlistId") Long playlistId);

    // 7. Check trùng bài hát (Giữ nguyên logic của sếp)
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END " +
            "FROM Playlist p JOIN p.songs s WHERE p.id = :playlistId AND s.id = :songId")
    boolean isSongInPlaylist(@Param("playlistId") Long playlistId, @Param("songId") Long songId);

    // 8. Lấy danh sách Playlist "Nổi bật" (Ví dụ: 5 playlist công khai mới nhất)
    List<Playlist> findTop5ByIsPublicTrueOrderByCreatedAtDesc();
}