package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.entity.Song;
import com.krisaleth.scriptify.entity.Users;
import com.krisaleth.scriptify.repository.SongRepository;
import com.krisaleth.scriptify.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final SongRepository songRepository;

    @Transactional(readOnly = true)
    public Set<Song> getFavouriteSongs(String email) {
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return user.getFavoriteSongs();
    }

    @Transactional(readOnly = true)
    public Users getMyProfile(String email) {
        return usersRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy profile"));
    }

    @Transactional(readOnly = true)
    public Page<Users> getAllUsers(Pageable pageable) {
        return usersRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Users getUserById(Long id) {
        return usersRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng ID: " + id));
    }

    @Transactional(readOnly = true)
    public Users getUserByEmail(String email) {
        return usersRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email không tồn tại"));
    }

    @Transactional
    public Users updateProfile(Long userId, String userName, String avatarUrl) {
        Users existingUser = getUserById(userId);
        if (userName != null && !userName.isBlank()) existingUser.setNickname(userName);
        if (avatarUrl != null && !avatarUrl.isBlank()) existingUser.setAvatarUrl(avatarUrl);
        return usersRepository.save(existingUser);
    }

    /**
     * THÊM/XÓA KHỎI DANH SÁCH YÊU THÍCH
     * Tự động cập nhật LikeCount trong bảng Songs
     */
    @Transactional
    public void toggleFavorite(String email, Long songId) {
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found"));

        // Xử lý null safety cho likeCount
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

    @Transactional(readOnly = true)
    public Set<Song> getFavoriteSongs(String email) {
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return user.getFavoriteSongs();
    }

    /**
     * XÓA NGƯỜI DÙNG
     * Dùng cho Tab User ở Admin Dashboard
     */
    @Transactional
    public void deleteUser(Long id) {
        Users user = getUserById(id);
        // Lưu ý: Nếu user có nhiều bài hát/playlist, cần xử lý delete cascade trong Entity
        usersRepository.delete(user);
    }
}