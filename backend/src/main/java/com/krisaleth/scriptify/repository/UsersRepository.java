package com.krisaleth.scriptify.repository;

import com.krisaleth.scriptify.entity.Users;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersRepository extends CrudRepository<Users, Long> {
    Optional<Users> findByEmail(String email);
    Optional<Users> findByVerificationCode(String verificationCode);
}
