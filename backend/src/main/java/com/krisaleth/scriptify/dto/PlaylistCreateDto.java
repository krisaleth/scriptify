package com.krisaleth.scriptify.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PlaylistCreateDto {
    private String name;
    private String description;
    private String thumbnailUrl;
    private Boolean isPublic;
    private List<Long> songIds;
}

