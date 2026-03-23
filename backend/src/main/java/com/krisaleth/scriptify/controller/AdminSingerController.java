package com.krisaleth.scriptify.controller;

import com.krisaleth.scriptify.entity.Singer;
import com.krisaleth.scriptify.service.AdminSingerService;
import com.krisaleth.scriptify.service.SingerService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/singer")
@AllArgsConstructor
public class AdminSingerController {
    @Autowired
    private AdminSingerService adminSingerService;
    @Autowired
    private SingerService singerService;

    @GetMapping()
    public ResponseEntity<List<Singer>> getAllSinger(){
         List<Singer> singers = adminSingerService.findAll();
         return new ResponseEntity<>(singers, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Singer>> getSingerById(@PathVariable Long id){
        Optional<Singer> singer = singerService.findById(id);
        if (singer.isPresent()) {
            return new ResponseEntity<>(singer,HttpStatus.OK);
        }
        else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/search/{name}")
    public ResponseEntity<List<Singer>> findByName(@PathVariable String name){
        List<Singer> singers = adminSingerService.findByName(name);
        return new ResponseEntity<>(singers, HttpStatus.OK);
    }

    @PostMapping()
    public ResponseEntity<Singer> create(@RequestBody Singer singer) {
        return new ResponseEntity<>(adminSingerService.createSinger(singer), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Singer> update(@RequestBody Singer singer, @PathVariable Long id) {
        Singer existingSinger = singerService.findById(id).get();
        if  (existingSinger == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        else {
            return new ResponseEntity<>(adminSingerService.updateSinger(singer, id), HttpStatus.OK);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Singer> delete(@PathVariable Long id) {
        Optional<Singer> singer = adminSingerService.findById(id);
        if (singer.isPresent()) {
            adminSingerService.deleteSinger(id);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

}
