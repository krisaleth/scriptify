package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.entity.Song;
import com.krisaleth.scriptify.entity.Users;
import com.krisaleth.scriptify.repository.SongRepository;
import com.krisaleth.scriptify.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UsersRepository usersRepository;
    private final SongRepository songRepository;
    private final S3Client s3Client;
    private final PasswordEncoder passwordEncoder;

    @Value("${r2.bucket-name}")
    private String bucketName;

    /**
     * ✅ 1. LẤY THÔNG TIN CÁ NHÂN (Fix lỗi dòng 36 ở Controller)
     */
    @Transactional(readOnly = true)
    public Users getMyProfile(String email) {
        return getUserByEmail(email);
    }

    /**
     * ✅ 2. LẤY TẤT CẢ USER (Fix lỗi dòng 97 ở Controller)
     */
    @Transactional(readOnly = true)
    public Page<Users> getAllUsers(Pageable pageable) {
        return usersRepository.findAll(pageable);
    }

    /**
     * ✅ 3. XÓA NGƯỜI DÙNG (Fix lỗi dòng 106 ở Controller)
     */
    @Transactional
    public void deleteUser(Long id) {
        Users user = getUserById(id);
        // Xóa ảnh trên R2 trước khi xóa user trong DB
        if (user.getAvatarUrl() != null) {
            deleteFromR2(user.getAvatarUrl());
        }
        usersRepository.delete(user);
    }

    // --- CÁC HÀM SẾP ĐÃ CÓ (Giữ nguyên bên dưới) ---

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        Users user = getUserById(userId);
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không chính xác");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        usersRepository.save(user);
    }

    @Transactional
    public Users updateProfile(Long userId, String nickname, MultipartFile avatarFile) {
        Users existingUser = getUserById(userId);
        if (nickname != null && !nickname.isBlank()) {
            existingUser.setNickname(nickname);
        }
        if (avatarFile != null && !avatarFile.isEmpty()) {
            try {
                if (!"/avatars/default-avatar.png".equals(existingUser.getAvatarUrl())) {
                    deleteFromR2(existingUser.getAvatarUrl());
                }
                String newPath = uploadAvatarToR2(avatarFile);
                existingUser.setAvatarUrl(newPath);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi upload ảnh lên R2");
            }
        }
        return usersRepository.save(existingUser);
    }

    @Transactional(readOnly = true)
    public Set<Song> getFavoriteSongs(String email) {
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.getFavoriteSongs().size();
        return user.getFavoriteSongs();
    }

    @Transactional
    public void toggleFavorite(String email, Long songId) {
        Users user = getUserByEmail(email);
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found"));

        if (user.getFavoriteSongs().contains(song)) {
            user.getFavoriteSongs().remove(song);
            song.setLikeCount(Math.max(0, (song.getLikeCount() == null ? 0 : song.getLikeCount()) - 1));
        } else {
            user.getFavoriteSongs().add(song);
            song.setLikeCount((song.getLikeCount() == null ? 0 : song.getLikeCount()) + 1);
        }
        usersRepository.save(user);
        songRepository.save(song);
    }

    private String uploadAvatarToR2(MultipartFile file) throws IOException {
        String fileName = "users/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();
        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
        return fileName;
    }

    private void deleteFromR2(String relativePath) {
        if (relativePath == null || relativePath.startsWith("assets/")) return;
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(relativePath)
                    .build());
        } catch (Exception e) {
            System.err.println("R2 Delete Error: " + relativePath);
        }
    }

    public Users getUserById(Long id) {
        return usersRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User ID not found"));
    }

    public Users getUserByEmail(String email) {
        return usersRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not found"));
    }
}