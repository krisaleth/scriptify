import { ArrowLeft, Play, Heart, Loader2, Music } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { getResourceUrl } from '@/utils/urlHelper';

const API_BASE = "/api";

interface MusicContextType {
  handlePlayTrack: (trackId: number) => void;
}

export function AlbumDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handlePlayTrack } = useOutletContext<MusicContextType>();

  const [album, setAlbum] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch chi tiết Album qua Proxy (Nhận đầy đủ dữ liệu từ Backend mới)
  useEffect(() => {
    const fetchAlbumDetail = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/albums/${id}`, {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setAlbum(data);
        }
      } catch (err) {
        console.error("Scriptify: Lỗi fetch album qua Proxy:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlbumDetail();
  }, [id]);

  // 2. KHÔNG CẦN DÙNG useMemo ĐỂ LỌC TOÀN CỤC NỮA! 
  // Lấy thẳng danh sách songs từ DTO Backend trả về, đảm bảo an toàn dữ liệu.
  const tracks = album?.songs || [];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background transition-colors duration-300">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background gap-4 p-8 text-center transition-colors duration-300">
        <p className="text-muted-foreground text-xl font-bold uppercase tracking-widest italic">Album này không tồn tại trong Cloud!</p>
        <button onClick={() => navigate('/albums')} className="text-primary hover:text-primary/80 font-black transition-all uppercase underline decoration-primary/30 underline-offset-8">
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-muted/30 to-background pb-32 custom-scrollbar transition-colors duration-300">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent px-8 pt-8 pb-8 transition-colors duration-300">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group bg-secondary/50 w-fit px-4 py-1.5 rounded-full border border-border"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase italic">Quay lại</span>
        </button>

        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 max-w-6xl mx-auto">
          <div className="w-64 h-64 flex-shrink-0 shadow-2xl rounded-3xl overflow-hidden group border border-border transition-colors">
            <img
              src={getResourceUrl(album.coverImageUrl)}
              alt={album.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")}
            />
          </div>
          
          <div className="flex flex-col items-center md:items-start flex-1">
            <p className="text-[10px] font-black text-primary mb-2 uppercase tracking-[0.4em] italic transition-colors">Cloud Album</p>
            <h1 className="text-5xl md:text-7xl font-black text-foreground mb-4 tracking-tighter leading-none text-center md:text-left uppercase italic transition-colors">
              {album.title}
            </h1>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 font-black uppercase tracking-tight italic transition-colors">
              <span className="text-foreground hover:text-primary cursor-pointer transition-colors">
                {album.artist?.name || 'Nghệ sĩ ẩn danh'}
              </span>
              <span className="opacity-50">•</span>
              <span>{album.releaseYear || '2026'}</span>
              <span className="opacity-50">•</span>
              {/* Sử dụng biến songCount từ AlbumResponse */}
              <span className="text-primary transition-colors">{album.songCount || 0} Tracks</span>
            </div>

            <button
              onClick={() => tracks.length > 0 && handlePlayTrack(tracks[0].id)}
              className="w-16 h-16 bg-primary rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl hover:bg-primary/90 active:scale-95 group"
            >
              <Play className="w-8 h-8 text-primary-foreground ml-1 fill-current group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="px-8 mt-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-[40px_1fr_120px] px-4 py-2 border-b border-border text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-4 italic transition-colors">
            <span>#</span>
            <span>Giai điệu & Nghệ sĩ</span>
            <div className="flex justify-end pr-4 italic">Streams</div>
          </div>

          <div className="space-y-1">
            {tracks.length > 0 ? (
              tracks.map((track: any, index: number) => (
                <div
                  key={track.id}
                  className="grid grid-cols-[40px_1fr_120px] items-center gap-4 px-4 py-3 rounded-2xl hover:bg-accent transition-colors duration-300 group cursor-pointer border border-transparent hover:border-border"
                  onClick={() => handlePlayTrack(track.id)}
                >
                  <div className="flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                    <span className="group-hover:hidden text-[10px] font-black italic">{index + 1}</span>
                    <Play className="w-4 h-4 hidden group-hover:block fill-current" />
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <div className="text-foreground font-black text-sm truncate group-hover:text-primary transition-colors uppercase italic tracking-tight">
                        {track.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate font-black uppercase tracking-widest mt-0.5 transition-colors">
                        {/* Vì SongShortResponse chỉ cần trả về artistName từ Album hoặc lấy trực tiếp tên artist của Album trên FE */}
                        {album.artist?.name}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 text-muted-foreground font-black text-[10px] pr-4 italic uppercase tracking-widest transition-colors">
                    <span className="tabular-nums opacity-60">{(track.viewCount || 0).toLocaleString()}</span>
                    <Heart size={14} className="hover:text-destructive transition-colors cursor-pointer" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50 transition-colors">
                <Music size={48} className="mb-4 opacity-50" />
                <p className="font-black italic text-[10px] uppercase tracking-widest opacity-80 text-center">
                    Album này chưa có bài hát nào... <br/>Vui lòng bổ sung sau sếp ơi!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}