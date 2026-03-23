package com.krisaleth.scriptify.repository;

import com.krisaleth.scriptify.entity.Singer;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SingerRepository {
    List<Singer> findAll();
    List<Singer> findByName(String name);
    Singer save(Singer singer);
    Singer findById(Long id);
    Singer findByUrl(String url);
    void delete(Singer singer);
}
