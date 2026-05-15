package com.krisaleth.scriptify.repository;

import com.krisaleth.scriptify.entity.tktUsers;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<tktUsers, Long> {

    Optional<tktUsers> findByTktEmail(String email);

    @EntityGraph(attributePaths = {"favoriteTktSongs", "favoriteTktSongs.tktArtist"})
    @Query("SELECT u FROM tktUsers u WHERE u.tktEmail = :email")
    Optional<tktUsers> findByEmailWithFavorites(@Param("email") String email);

    Optional<tktUsers> findByTktVerificationCode(String verificationCode);

    boolean existsByTktEmail(String email);

    boolean existsByTktNickname(String nickname);

    Optional<tktUsers> findByTktNickname(String nickname);
}