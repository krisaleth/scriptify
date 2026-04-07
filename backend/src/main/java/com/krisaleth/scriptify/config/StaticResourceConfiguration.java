package com.krisaleth.scriptify.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfiguration implements WebMvcConfigurer {
    @Value("${app.upload.music-dir}")
    private String musicDir;

    @Value("${app.upload.image-dir}")
    private String imageDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path musicPath = Paths.get(musicDir).toAbsolutePath().normalize();
        Path imagePath = Paths.get(imageDir).toAbsolutePath().normalize();

        registry.addResourceHandler("/uploads/music/**")
                .addResourceLocations(musicPath.toUri().toString());

        registry.addResourceHandler("/uploads/images/**")
                .addResourceLocations(imagePath.toUri().toString());
    }
}

