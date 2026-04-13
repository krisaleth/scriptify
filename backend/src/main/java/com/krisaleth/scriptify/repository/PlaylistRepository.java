package com.krisaleth.scriptify.repository;

import com.krisaleth.scriptify.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    // 1. Lấy danh sách Playlist của một User cụ thể
    List<Playlist> findByUser_Id(Long userId);

    // 2. Lấy danh sách các Playlist được công khai
    List<Playlist> findByIsPublicTrue();

    // ================= BỔ SUNG MỚI =================

    // 3. Tìm Playlist theo ID và UserID (Cực kỳ quan trọng để chống hack IDOR)
    // Giúp đảm bảo User chỉ có thể thao tác (sửa/xóa/thêm nhạc) trên Playlist của chính họ
    Optional<Playlist> findByIdAndUser_Id(Long id, Long userId);

    // 4. Đếm tổng số lượng bài hát hiện có trong 1 Playlist
    // Trả về int, dùng để check quy tắc "Không vượt quá 200 bài"
    @Query("SELECT COUNT(s) FROM Playlist p JOIN p.songs s WHERE p.id = :playlistId")
    int countSongsInPlaylist(@Param("playlistId") Long playlistId);

    // 5. Kiểm tra xem một bài hát đã tồn tại trong Playlist chưa
    // Trả về true nếu đã có, false nếu chưa có (Dùng để báo lỗi trùng lặp)
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Playlist p JOIN p.songs s WHERE p.id = :playlistId AND s.id = :songId")
    boolean isSongInPlaylist(@Param("playlistId") Long playlistId, @Param("songId") Long songId);
}