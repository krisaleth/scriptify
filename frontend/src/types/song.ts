/**
 * Định nghĩa cấu trúc dữ liệu Nghệ sĩ
 */
export interface Artist {
  id?: number;
  name: string;
  bio?: string;
  imageUrl?: string;
}

/**
 * Định nghĩa cấu trúc dữ liệu Album
 */
export interface Album {
  id?: number;
  title: string;
  coverImageUrl?: string;
  releaseYear?: number;
  artist?: Artist;
}

/**
 * Interface chính cho Bài hát (Song)
 * Dùng để đồng bộ dữ liệu từ Backend và hiển thị trên UI
 */
export interface Song {
  id: number;
  title: string;
  duration: number;      // Thời lượng tính bằng giây
  imageUrl: string;      // Đường dẫn ảnh lưu trên R2
  filePath: string;      // Đường dẫn file nhạc lưu trên R2
  viewCount: number;     // Số lượt nghe
  likeCount: number;     // Số lượt yêu thích
  artist?: Artist;       // Thông tin nghệ sĩ sở hữu
  album?: Album;         // Thông tin album (nếu có)
  createdAt?: string;
}

/**
 * Kiểu dữ liệu cho Context dùng trong Outlet (React Router)
 * Giúp các trang con (Home, Fav, Album) gọi được hàm phát nhạc của App
 */
export interface MusicContextType {
  handlePlayTrack: (trackId: number) => void;
  currentTrackId: number | null;
  isPlaying: boolean;
  allSongs: Song[];
}