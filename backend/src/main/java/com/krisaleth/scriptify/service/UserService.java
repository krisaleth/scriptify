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

    @Value("${r2.bucket-name}")
    private String bucketName;

    /**
     * UPLOAD AVATAR LÊN R2
     */
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

    /**
     * XÓA FILE TRÊN R2
     */
    private void deleteFromR2(String relativePath) {
        // Không xóa nếu là ảnh mặc định
        if (relativePath != null && !relativePath.contains("default-avatar.png") && !relativePath.contains("assets/")) {
            try {
                DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(relativePath)
                        .build();
                s3Client.deleteObject(deleteObjectRequest);
            } catch (Exception e) {
                System.err.println("Lỗi xóa file trên R2: " + relativePath);
            }
        }
    }

    /**
     * CẬP NHẬT PROFILE NGƯỜI DÙNG
     */
    @Transactional
    public Users updateProfile(Long userId, String nickname, MultipartFile avatarFile) {
        Users existingUser = getUserById(userId);

        if (nickname != null && !nickname.isBlank()) {
            existingUser.setNickname(nickname);
        }

        if (avatarFile != null && !avatarFile.isEmpty()) {
            try {
                // Xóa ảnh cũ trước khi lưu ảnh mới
                deleteFromR2(existingUser.getAvatarUrl());
                String newPath = uploadAvatarToR2(avatarFile);
                existingUser.setAvatarUrl(newPath);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi cập nhật ảnh đại diện");
            }
        }
        return usersRepository.save(existingUser);
    }

    /**
     * LẤY DANH SÁCH YÊU THÍCH (Tối ưu để tránh N+1 Query)
     */
    @Transactional(readOnly = true)
    public Set<Song> getFavoriteSongs(String email) {
        // Tìm user và fetch luôn các bài hát yêu thích trong 1 nốt nhạc
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));

        // Trigger lazy loading một cách chủ động hoặc dùng Fetch Join ở Repo
        user.getFavoriteSongs().size();
        return user.getFavoriteSongs();
    }

    @Transactional
    public void toggleFavorite(String email, Long songId) {
        Users user = getUserByEmail(email);
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài hát"));

        int currentLikes = song.getLikeCount() != null ? song.getLikeCount() : 0;

        if (user.getFavoriteSongs().contains(song)) {
            user.getFavoriteSongs().remove(song);
            song.setLikeCount(Math.max(0, currentLikes - 1));
        } else {
            user.getFavoriteSongs().add(song);
            song.setLikeCount(currentLikes + 1);
        }

        usersRepository.save(user);
        songRepository.save(song);
    }

    // --- CÁC HÀM TRUY VẤN CƠ BẢN ---

    @Transactional(readOnly = true)
    public Users getMyProfile(String email) {
        return getUserByEmail(email);
    }

    @Transactional(readOnly = true)
    public Users getUserById(Long id) {
        return usersRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ID không tồn tại: " + id));
    }

    @Transactional(readOnly = true)
    public Users getUserByEmail(String email) {
        return usersRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email không tồn tại"));
    }

    @Transactional(readOnly = true)
    public Page<Users> getAllUsers(Pageable pageable) {
        return usersRepository.findAll(pageable);
    }

    @Transactional
    public void deleteUser(Long id) {
        Users user = getUserById(id);
        deleteFromR2(user.getAvatarUrl());
        usersRepository.delete(user);
    }
}