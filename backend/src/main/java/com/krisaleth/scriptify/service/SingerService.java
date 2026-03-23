package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.entity.Singer;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface SingerService {
    List<Singer> findAll();
    List<Singer> findByName(String name);
    Optional<Singer> findById(Long id);
    Optional<Singer> findByUrl(String url);
}
