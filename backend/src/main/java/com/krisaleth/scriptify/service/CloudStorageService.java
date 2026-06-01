package com.krisaleth.scriptify.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class CloudStorageService {
    private final S3Client s3Client;

    @Value("${r2.bucket-name}")
    private String bucketName;

    @Value("${r2.public-url}")
    private String publicUrl;

    public CloudStorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public String uploadFile(MultipartFile file, String folder) { // Xoá throws IOException
        try {
            // 1. Tạo path tương đối
            String relativePath = folder + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

            // 2. Đẩy file lên Cloudflare R2
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(relativePath)
                    .contentType(file.getContentType())
                    .build();

            // file.getBytes() chính là nơi phát sinh IOException
            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

            return relativePath;
        } catch (IOException e) {
            // Biến cái lỗi kỹ thuật (Checked) thành lỗi logic (Unchecked)
            // Khi ném lỗi này, @Transactional ở hàm signUp sẽ tự động Rollback
            throw new RuntimeException("Không thể đọc dữ liệu file: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi hệ thống khi upload lên Cloudflare: " + e.getMessage());
        }
    }

    // Hàm bổ trợ để FE lấy link full khi cần
    public String getFullUrl(String relativePath) {
        if (relativePath == null || relativePath.isEmpty()) return null;
        return publicUrl + "/" + relativePath;
    }
}
