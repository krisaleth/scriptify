package com.krisaleth.scriptify.config;

import com.mpatric.mp3agic.Mp3File;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

public class FileUtils {
    public static int getMp3Duration(MultipartFile file) {
        try {
            // Tạo file tạm để đọc metadata
            Path tempFile = Files.createTempFile("temp", ".mp3");
            file.transferTo(tempFile);

            Mp3File mp3file = new Mp3File(tempFile.toAbsolutePath().toString());
            long durationInSeconds = mp3file.getLengthInSeconds();

            // Xóa file tạm sau khi lấy xong data
            Files.delete(tempFile);

            return (int) durationInSeconds;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }
}
