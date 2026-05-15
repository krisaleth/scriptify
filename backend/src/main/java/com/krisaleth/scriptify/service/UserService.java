package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.entity.tktSong;
import com.krisaleth.scriptify.entity.tktUsers;
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

    @Transactional(readOnly = true)
    public tktUsers getMyProfile(String email) {
        return getUserByEmail(email);
    }

    @Transactional(readOnly = true)
    public Page<tktUsers> getAllUsers(Pageable pageable) {
        return usersRepository.findAll(pageable);
    }

    @Transactional
    public void deleteUser(Long id) {
        tktUsers user = getUserById(id);
        if (user.getAvatarUrl() != null) {
            deleteFromR2(user.getAvatarUrl());
        }
        usersRepository.delete(user);
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        tktUsers user = getUserById(userId);
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không chính xác");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        usersRepository.save(user);
    }

    @Transactional
    public tktUsers updateProfile(Long userId, String nickname, MultipartFile avatarFile) {
        tktUsers existingUser = getUserById(userId);
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
    public Set<tktSong> getFavoriteSongs(String email) {
        tktUsers user = usersRepository.findByTktEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.getFavoriteSongs().size();
        return user.getFavoriteSongs();
    }

    @Transactional
    public void toggleFavorite(String email, Long songId) {
        tktUsers user = getUserByEmail(email);
        tktSong song = songRepository.findById(songId)
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

    public tktUsers getUserById(Long id) {
        return usersRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User ID not found"));
    }

    public tktUsers getUserByEmail(String email) {
        return usersRepository.findByTktEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not found"));
    }
}