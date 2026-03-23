package com.krisaleth.scriptify.service;

import com.krisaleth.scriptify.entity.Singer;
import com.krisaleth.scriptify.repository.SingerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminSingerService implements SingerService {
    private SingerRepository singerRepository;

    @Override
    public List<Singer> findAll() {
        return singerRepository.findAll();
    }

    @Override
    public List<Singer> findByName(String name) {
        return singerRepository.findByName(name);
    }

    @Override
    public Optional<Singer> findById(Long id) {
        Singer singer = singerRepository.findById(id);
        return Optional.ofNullable(singer);
    }

    @Override
    public Optional<Singer> findByUrl(String url) {
        Singer singer = singerRepository.findByUrl(url);
        return Optional.ofNullable(singer);
    }

    public Singer createSinger(Singer singer) {
        Singer savedSinger = singerRepository.save(singer);
        return savedSinger;
    }

    public Singer updateSinger(Singer singer, Long id) {
        Singer existingSinger = singerRepository.findById(id);
        if (existingSinger == null) {
            return null;
        }
        existingSinger.setSingerName(singer.getSingerName());
        return singerRepository.save(existingSinger);
    }

    public void deleteSinger(Long id) {
        Singer singer = singerRepository.findById(id);
        if (singer == null) {
            return;
        }
        singerRepository.delete(singer);
    }
}
