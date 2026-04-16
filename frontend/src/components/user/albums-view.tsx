import { Play, Search, Loader2, AlertCircle, Music } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

// Dùng duy nhất API_BASE vì bồ lưu mọi thứ (data + media) trong route /api
const API_BASE = "http://localhost:8080/api";

interface MusicContextType {
  handlePlayTrack: (trackId: number) => void;
  allSongs: any[]; 
}

export function AlbumsView() {
  const navigate = useNavigate();
  const { handlePlayTrack, allSongs } = useOutletContext<MusicContextType>();

  const [albums, setAlbums] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch danh sách Album
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE}/albums?size=50`);
        if (!response.ok) throw new Error("Không thể tải danh sách album");
        
        const data = await response.json();
        // PageImpl của Spring Boot luôn bọc dữ liệu trong .content
        setAlbums(data.content || (Array.isArray(data) ? data : []));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlbums();
  }, []);

  // 2. Logic lọc tìm kiếm
  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      const titleMatch = album.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const artistMatch = album.artist?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return titleMatch || artistMatch;
    });
  }, [albums, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black min-h-screen">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32 custom-scrollbar">
      {/* Header */}
      <div className="bg-gradient-to-b from-indigo-900/40 to-transparent pt-12 pb-8 px-8">
        <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase italic">Albums</h2>
        <p className="text-zinc-400 font-medium">Bộ sưu tập âm nhạc của riêng bồ</p>
        
        <div className="relative mt-8 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm album hoặc nghệ sĩ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/50 text-white placeholder-zinc-500 rounded-full py-3.5 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border border-zinc-700/50"
          />
        </div>
      </div>

      <div className="px-8 mt-4">
        {filteredAlbums.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {filteredAlbums.map((album) => {
              // Tìm bài hát đầu tiên thuộc album để Play nhanh
              const firstTrackInAlbum = allSongs?.find(s => s.album?.id === album.id);

              return (
                <div
                  key={album.id}
                  onClick={() => navigate(`/album/${album.id}`)}
                  className="bg-zinc-900/40 p-4 rounded-xl hover:bg-zinc-800/60 transition-all cursor-pointer group shadow-lg border border-transparent hover:border-zinc-700/50"
                >
                  <div className="relative mb-4 overflow-hidden rounded-lg aspect-square shadow-2xl">
                    <img
                      // Sử dụng API_BASE vì bồ lưu ảnh trong route /api
                      src={album.coverImageUrl ? `${API_BASE}${album.coverImageUrl}` : "/default-album.png"}
                      alt={album.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      // Xử lý nếu ảnh lỗi thì hiện ảnh mặc định
                      onError={(e) => (e.currentTarget.src = "/default-album.png")}
                    />
                    
                    {firstTrackInAlbum && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayTrack(firstTrackInAlbum.id);
                        }}
                        className="absolute bottom-3 right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all shadow-2xl hover:bg-green-400 active:scale-95"
                      >
                        <Play className="w-6 h-6 text-black ml-1 fill-current" />
                      </button>
                    )}
                  </div>

                  <h4 className="text-white font-bold truncate mb-1 group-hover:text-green-400 transition-colors">
                    {album.title}
                  </h4>
                  <p className="text-xs text-zinc-400 truncate">
                    {album.artist?.name || 'Nghệ sĩ ẩn danh'}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-black">
                      {album.releaseYear || '2026'}
                    </span>
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">• Album</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600 italic">
            <Music size={48} className="mb-4 opacity-20" />
            <p>Không tìm thấy Album nào bồ ơi!</p>
          </div>
        )}
      </div>
    </div>
  );
}