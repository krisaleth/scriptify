// src/types/song.ts

export interface Author {
    authorid: number;
    authorname: string;
    url?: string; // Ảnh đại diện của nghệ sĩ
}

export interface Song {
    id: number;
    name: string;        // Tên bài hát
    url: string;         // Link ảnh cover hoặc link stream (tùy bồ cấu hình ở Backend)
    authorid: number;    // ID của tác giả
    author?: Author;     // Thông tin chi tiết tác giả (nếu Backend trả về nested object)
    
    // Các trường bổ sung cho logic Backend bồ vừa làm
    likeCount: number;   // Số lượt thích (khớp với like_count trong Java)
    commentCount?: number; 
    
    // Các trường optional phục vụ cho việc hiển thị
    duration?: string;   // Thời lượng bài hát
    category?: string;   // Thể loại (Indigo, Pop, Rock...)
}