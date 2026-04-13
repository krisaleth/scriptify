package com.krisaleth.scriptify.repository;

import com.krisaleth.scriptify.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {

    // Tìm user bằng email (Dùng cho tính năng Đăng nhập sau này)
    Optional<Users> findByEmail(String email);

    // Tìm user bằng mã xác thực (Dùng cho tính năng Kích hoạt tài khoản)
    Optional<Users> findByVerificationCode(String verificationCode);

    // Kiểm tra xem Email đã tồn tại trong DB chưa (Dùng khi Đăng ký)
    boolean existsByEmail(String email);

    // Kiểm tra xem Username đã tồn tại trong DB chưa (Dùng khi Đăng ký)
    boolean existsByUsername(String username);
}