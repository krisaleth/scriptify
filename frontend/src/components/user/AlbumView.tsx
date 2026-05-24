import { Play, Heart, Search, Loader2, Music2, Clock3, Disc3 } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getResourceUrl } from "@/utils/urlHelper";
import { apiRequest } from "@/utils/apiClient"; 

const API_BASE = "/api";

interface MusicContextType {
  handlePlayTrack: (trackId: number) => void;
}

export function AlbumView() {
  const { id } = useParams<{ id: string }>(); // Lấy ID album từ URL (ví dụ: /album/123)
  const { handlePlayTrack } = useOutletContext<MusicContextType>();
  
  const [albumData, setAlbumData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH DỮ LIỆU ALBUM ---
  const fetchAlbumDetails = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      // Giả sử API trả về chi tiết album kèm theo mảng .songs
      const data = await apiRequest(`${API_BASE}/albums/${id}`);
      if (data) {
        setAlbumData(data);
      }
    } catch (err) {
      console.error("Scriptify: Lỗi tải album", err);
      toast.error("Không thể tải thông tin Album này!");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAlbumDetails();
  }, [fetchAlbumDetails]);

  // --- FILTER BÀI HÁT TRONG ALBUM ---
  const filteredTracks = useMemo(() => {
    if (!albumData?.songs) return [];
    return albumData.songs.filter((track: any) => {
      const titleMatch = track.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const artistMatch = track.artist?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return titleMatch || artistMatch;
    });
  }, [searchQuery, albumData]);

  // --- UI TRẠNG THÁI LOADING ---
  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center bg-background min-h-[70vh] transition-colors duration-300">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  if (!albumData) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background min-h-[70vh]">
      <Disc3 className="w-20 h-20 text-muted-foreground/50 mb-4 animate-spin-slow" />
      <h2 className="text-2xl font-black italic text-muted-foreground uppercase">Album không tồn tại hoặc đã bị xóa</h2>
    </div>
  );

  // --- UI CHÍNH ---
  return (
    <div className="flex-1 overflow-y-auto bg-background pb-32 custom-scrollbar transition-colors duration-300">
      <div className="pt-16 pb-8 px-8">
        <div className="flex flex-col md:flex-row items-end gap-8 mb-8">
          
          {/* Ảnh bìa Album */}
          <div className="w-52 h-52 bg-secondary rounded-3xl shadow-2xl flex items-center justify-center flex-shrink-0 border border-border overflow-hidden animate-in zoom-in duration-700">
            {albumData.coverImageUrl ? (
              <img 
                src={getResourceUrl(albumData.coverImageUrl)} 
                alt={albumData.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                onError={(e) => e.currentTarget.src = "/assets/default-cover.png"}
              />
            ) : (
              <Disc3 className="w-24 h-24 text-muted-foreground drop-shadow-md" />
            )}
          </div>

          {/* Thông tin Album */}
          <div className="flex-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-3 italic font-sans">
              Album • {albumData.releaseYear || "Unknown Year"}
            </p>
            <h2 className="text-5xl lg:text-7xl font-black text-foreground mb-6 tracking-tighter italic uppercase leading-none font-sans line-clamp-2">
              {albumData.title}
            </h2>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-foreground font-black uppercase italic text-sm tracking-widest hover:text-primary transition-colors cursor-pointer">
                  {albumData.artist?.name || "Various Artists"}
                </span>
              </div>
              <span className="text-muted-foreground font-bold">•</span>
              <span className="text-primary font-black italic uppercase text-xs tracking-widest">{albumData.songs?.length || 0} Tracks</span>
            </div>
          </div>
        </div>

        {/* Thanh Tìm Kiếm Trng Album */}
        <div className="relative mt-4 max-w-sm group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Tìm bài hát trong album..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/50 border border-border text-foreground placeholder-muted-foreground rounded-xl py-3 pl-11 pr-6 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all text-sm italic shadow-sm"
          />
        </div>
      </div>

      {/* Danh sách bài hát */}
      <div className="px-8 mt-4">
        <div className="grid grid-cols-[16px_4fr_3fr_1fr_48px] gap-4 px-4 py-2 border-b border-border text-muted-foreground text-[10px] font-black uppercase tracking-[0.25em] mb-4 italic">
          <div>#</div>
          <div>Giai điệu</div>
          <div>Nghệ sĩ</div>
          <div className="flex justify-center"><Clock3 className="w-4 h-4" /></div>
          <div></div>
        </div>

        {!albumData.songs || albumData.songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-secondary/20 rounded-[3rem] border border-dashed border-border">
            <Disc3 className="w-16 h-16 text-muted-foreground/30 mb-4 animate-spin-slow" />
            <p className="text-muted-foreground/70 font-black uppercase text-[10px] tracking-[0.3em] leading-relaxed text-center italic">
              Album này chưa có bài hát nào...
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTracks.map((track: any, index: number) => (
              <div 
                key={track.id} 
                className="grid grid-cols-[16px_4fr_3fr_1fr_48px] gap-4 px-4 py-3 rounded-2xl hover:bg-accent transition-all group items-center border border-transparent hover:border-border"
              >
                <div className="text-muted-foreground font-black text-xs group-hover:text-primary transition-colors italic">
                   <span className="group-hover:hidden">{index + 1}</span>
                   <button onClick={() => handlePlayTrack(track.id)}>
                    <Play className="w-3.5 h-3.5 hidden group-hover:block fill-current text-primary cursor-pointer" />
                   </button>
                </div>
                
                <div className="flex items-center gap-4 min-w-0">
                  <div className="min-w-0">
                    <h4 className="text-foreground font-black truncate text-sm uppercase tracking-tight italic group-hover:text-primary transition-colors">{track.title}</h4>
                  </div>
                </div>

                <div className="text-muted-foreground text-[10px] font-black uppercase tracking-widest truncate hidden md:block group-hover:text-foreground/70 transition-colors italic">
                  {track.artist?.name || albumData.artist?.name}
                </div>

                <div className="flex justify-center text-muted-foreground font-black text-[10px] tabular-nums">
                  {/* Nếu API có trả về duration thì dùng, không thì để rỗng hoặc tính toán lại */}
                  {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : "--:--"}
                </div>

                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-muted-foreground hover:text-primary transition-colors" title="Thêm vào yêu thích">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}