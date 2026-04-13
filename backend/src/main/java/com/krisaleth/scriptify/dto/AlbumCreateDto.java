package com.krisaleth.scriptify.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AlbumCreateDto {
    private String title;
    private Integer releaseYear;
    private Long artistId;
}

