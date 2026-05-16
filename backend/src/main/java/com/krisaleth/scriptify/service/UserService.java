package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.dto.ChangePasswordDto;
import com.krisaleth.scriptify.entity.tktSong;
import com.krisaleth.scriptify.entity.tktUsers;
import com.krisaleth.scriptify.repository.SongRepository;
import com.krisaleth.scriptify.repository.UsersRepository;
import com.krisaleth.scriptify.response.SongResponse;
import com.krisaleth.scriptify.response.UserResponse;
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
import java.util.*;

import static java.util.stream.Collectors.toSet;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UsersRepository usersRepository;
    private final SongRepository songRepository;
    private final S3Client s3Client;
    private final PasswordEncoder passwordEncoder;

    @Value("${r2.bucket-name}")
    private String bucketName;

    private UserResponse convertToResponse(tktUsers user) {
        if (user == null) return null;

        Set<Long> favIds = new HashSet<>();
        List<UserResponse.FavoriteSongShort> favShorts = new ArrayList<>();

        if (user.getFavoriteSongs() != null) {
            user.getFavoriteSongs().forEach(song -> {
                favIds.add(song.getId());

                favShorts.add(UserResponse.FavoriteSongShort.builder()
                        .id(song.getId())
                        .title(song.getTitle())
                        .imageUrl(song.getImageUrl())
                        .build());
            });
        }

        return UserResponse.builder()
                .id(user.getId())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : "USER")
                .avatarUrl(user.getAvatarUrl() != null ? user.getAvatarUrl() : "assets/default-avatar.png")
                .favoriteSongIds(favIds)
                .favoriteSongs(favShorts)
                .build();
    }

    private SongResponse convertToSongResponse(tktSong song) {
        return SongResponse.builder()
                .id(song.getId())
                .title(song.getTitle())
                .duration(song.getDuration())
                .filePath(song.getFilePath())
                .imageUrl(song.getImageUrl())
                .viewCount(song.getViewCount())
                .likeCount(song.getLikeCount())
                .createdAt(song.getCreatedAt())
                .artist(SongResponse.ArtistShortResponse.builder()
                        .id(song.getArtist().getId())
                        .name(song.getArtist().getName())
                        .build())
                .albumTitle(song.getAlbum() != null ? song.getAlbum().getTitle() : null)
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponse getMyProfile(String email) {
        return getUserByEmail(email);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return usersRepository.findAll(pageable).map(this::convertToResponse);
    }

    @Transactional
    public void deleteUser(Long id) {
        tktUsers user = usersRepository.findById(id).orElseThrow();
        if (user.getAvatarUrl() != null) {
            deleteFromR2(user.getAvatarUrl());
        }
        usersRepository.delete(user);
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        tktUsers user = usersRepository.findById(userId).orElseThrow();
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không chính xác");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        usersRepository.save(user);
    }

    @Transactional
    public UserResponse updateProfile(Long userId, String nickname, MultipartFile avatarFile) {
        tktUsers existingUser = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (nickname != null && !nickname.isBlank()) {
            existingUser.setNickname(nickname);
        }
        if (avatarFile != null && !avatarFile.isEmpty()) {
            try {
                if (!"/assets/default-avatar.png".equals(existingUser.getAvatarUrl())) {
                    deleteFromR2(existingUser.getAvatarUrl());
                }
                String newPath = uploadAvatarToR2(avatarFile);
                existingUser.setAvatarUrl(newPath);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi upload ảnh lên R2");
            }
        }
        return convertToResponse(usersRepository.save(existingUser));
    }

    @Transactional(readOnly = true)
    public Set<SongResponse> getFavoriteSongs(String email) {
        tktUsers user = usersRepository.findByTktEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.getFavoriteSongs().size();
        return user.getFavoriteSongs().stream().map(this::convertToSongResponse).collect(toSet());
    }

    @Transactional
    public void toggleFavorite(String email, Long songId) {
        tktUsers user = usersRepository.findByTktEmail(email).orElseThrow();
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

    @Transactional
    public void changePassword(String email, ChangePasswordDto request) {
        tktUsers user = usersRepository.findByTktEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu cũ không chính xác!");
        }

        // 3. Kiểm tra mật khẩu mới không được trùng mật khẩu cũ
        if (request.getOldPassword().equals(request.getNewPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu mới phải khác mật khẩu cũ sếp ơi!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        usersRepository.save(user);
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

    public UserResponse getUserById(Long id) {
        return convertToResponse(usersRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User ID not found")));
    }

    public UserResponse getUserByEmail(String email) {
        return convertToResponse(usersRepository.findByTktEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not found")));
    }
}