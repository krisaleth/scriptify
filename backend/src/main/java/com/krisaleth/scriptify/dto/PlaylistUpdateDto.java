package com.krisaleth.scriptify.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class PlaylistUpdateDto {
    private String name;
    private String description;
    private MultipartFile thumbnail;
    private Boolean isPublic;
    private List<Long> songIds;
}

