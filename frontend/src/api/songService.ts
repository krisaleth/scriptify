import { Song } from "@/types/song";

export const searchSongs = async (query: string): Promise<Song[]> => {
  const token = localStorage.getItem('token'); // Lấy JWT Token đã lưu khi Login
  
  const response = await fetch(`/api/songs/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Gửi kèm Token để qua cửa Security
    }
  });

  if (!response.ok) {
    throw new Error('Lỗi khi lấy dữ liệu từ Server');
  }

  return response.json();
};