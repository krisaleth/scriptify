package com.krisaleth.scriptify.repository;

import com.krisaleth.scriptify.entity.Users;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {

    // 1. Tìm user bằng email (Dùng cho Auth & Service)
    Optional<Users> findByEmail(String email);

    // 2. TỐI ƯU: Lấy User kèm theo danh sách FavoriteSongs trong 1 query duy nhất
    // Tránh lỗi LazyInitializationException và lỗi N+1 khi vào Profile
    @EntityGraph(attributePaths = {"favoriteSongs", "favoriteSongs.artist"})
    @org.springframework.data.jpa.repository.Query("SELECT u FROM Users u WHERE u.email = :email")
    Optional<Users> findByEmailWithFavorites(String email);

    // 3. Tìm user bằng mã xác thực (Dùng cho Kích hoạt tài khoản)
    Optional<Users> findByVerificationCode(String verificationCode);

    // 4. Các hàm kiểm tra tồn tại (Dùng khi Đăng ký / Cập nhật Profile)
    boolean existsByEmail(String email);

    // Đổi từ existsByNickname sang existsByUsername nếu DB sếp dùng cột username làm định danh
    // Ở đây tui giữ Nickname theo code Service của sếp
    boolean existsByNickname(String nickname);

    // 5. Tìm nhanh theo Nickname (Dành cho tính năng Search người dùng nếu cần)
    Optional<Users> findByNickname(String nickname);
}