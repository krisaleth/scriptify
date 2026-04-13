package com.krisaleth.scriptify.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
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
        String projectDir = System.getProperty("user.dir");

        // Đảm bảo đường dẫn vật lý kết thúc bằng dấu /
        String uploadPath = projectDir + File.separator + "uploads" + File.separator;

        // Convert đường dẫn Windows sang dạng file:/C:/...
        String resourceLocation = "file:" + uploadPath.replace("\\", "/");

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation)
                .setCachePeriod(3600);
    }
}

