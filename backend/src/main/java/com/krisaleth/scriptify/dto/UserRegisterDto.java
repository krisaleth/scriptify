package com.krisaleth.scriptify.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class UserRegisterDto {
    private String email;
    private String nickname;
    private String password;

    private MultipartFile avatarFile;
}