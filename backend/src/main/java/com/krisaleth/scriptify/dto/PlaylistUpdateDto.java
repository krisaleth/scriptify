package com.krisaleth.scriptify.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlaylistUpdateDto {
    private String name;
    private String description;
    private String thumbnailUrl;
    private Boolean isPublic;
}

