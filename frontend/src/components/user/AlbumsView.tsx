import { Play, Search, Loader2, Music } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getResourceUrl } from '@/utils/urlHelper';
import { MusicContextType } from '@/types/song';

// ĐỔI SANG ĐƯỜNG DẪN TƯƠNG ĐỐI: Để đi qua Vite Proxy/Nginx né lỗi SSL
const API_BASE = "/api";

export function AlbumsView() {
  const navigate = useNavigate();
  const { handlePlayTrack, allSongs } = useOutletContext<MusicContextType>();

  const [albums, setAlbums] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch danh sách Album qua Proxy với cơ chế Cookie
  const fetchAlbums = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/albums?size=50`, {
        method: "GET",
        credentials: "include", // Gửi kèm HttpOnly Cookie qua Proxy
      });
      
      if (!response.ok) throw new Error("Không thể kết nối đến máy chủ Cloud");
      
      const data = await response.json();
      // Xử lý cả PageImpl (.content) hoặc mảng thuần tùy theo Backend trả về
      setAlbums(data.content || (Array.isArray(data) ? data : []));
    } catch (err: any) {
      console.error("Scriptify: Lỗi fetch album qua Proxy:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  // 2. Logic lọc tìm kiếm
  const filteredAlbums = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return albums.filter((album) => 
      album.title?.toLowerCase().includes(query) ||
      album.artist?.name?.toLowerCase().includes(query)
    );
  }, [albums, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-screen">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background pb-32 custom-scrollbar">
      {/* Header Flat Design */}
      <div className="pt-12 pb-8 px-8">
        <h2 className="text-4xl font-black text-foreground mb-2 tracking-tighter uppercase italic">Albums</h2>
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] italic">Khám phá những tuyệt phẩm từ Scriptify Cloud</p>
        
        <div className="relative mt-8 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Tìm tên album hoặc nghệ sĩ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/50 text-foreground placeholder-muted-foreground rounded-full py-3.5 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all border border-border"
          />
        </div>
      </div>

      <div className="px-8 mt-4">
        {filteredAlbums.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {filteredAlbums.map((album) => {
              // Tìm bài hát đầu tiên để Play nhanh ngay tại Card
              const firstTrackInAlbum = allSongs?.find(s => s.album?.id === album.id);

              return (
                <div
                  key={album.id}
                  onClick={() => navigate(`/album/${album.id}`)}
                  className="bg-secondary/30 p-4 rounded-2xl hover:bg-accent transition-all cursor-pointer group shadow-md border border-transparent hover:border-border"
                >
                  <div className="relative mb-4 overflow-hidden rounded-xl aspect-square shadow-lg border border-border">
                    <img
                      src={getResourceUrl(album.coverImageUrl)}
                      alt={album.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")}
                    />
                    
                    {/* Nút Play nhanh */}
                    {firstTrackInAlbum && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayTrack(firstTrackInAlbum.id);
                        }}
                        className="absolute bottom-3 right-3 w-12 h-12 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all shadow-lg hover:bg-primary/90 active:scale-95"
                      >
                        <Play className="w-6 h-6 text-primary-foreground ml-1 fill-current" />
                      </button>
                    )}
                  </div>

                  <h4 className="text-foreground font-black truncate mb-1 group-hover:text-primary transition-colors uppercase italic tracking-tight">
                    {album.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground truncate font-black uppercase tracking-widest">
                    {album.artist?.name || 'Nghệ sĩ ẩn danh'}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-[9px] bg-background/80 text-primary px-2 py-0.5 rounded-full font-black border border-border">
                      {album.releaseYear || '2026'}
                    </span>
                    <span className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.2em] italic">• Album</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-secondary/10 rounded-3xl border border-dashed border-border">
            <Music size={48} className="mb-4 text-muted-foreground/30 animate-pulse" />
            <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest italic">Hệ thống Cloud chưa tìm thấy dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  );
}