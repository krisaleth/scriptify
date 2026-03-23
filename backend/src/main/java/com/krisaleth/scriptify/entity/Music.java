package com.krisaleth.scriptify.entity;

import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Music {
    private Long id;
    private String title;
    private String description;
    private String image;
    private String file;
    private String url;
}
