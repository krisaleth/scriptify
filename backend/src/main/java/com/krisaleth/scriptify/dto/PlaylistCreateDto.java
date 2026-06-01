package com.krisaleth.scriptify.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile; // Thêm cái này

import java.util.List;

@Getter
@Setter
public class PlaylistCreateDto {
    private String name;
    private String description;
    private MultipartFile thumbnail; // ✅ Đổi từ String Url sang MultipartFile
    private Boolean isPublic;
    private List<Long> songIds;
}
