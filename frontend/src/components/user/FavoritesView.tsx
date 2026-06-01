import { Play, Heart, Search, Loader2, LogIn, Music2, Clock3 } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from "@/store/useAuthStore";
import { getResourceUrl } from "@/utils/urlHelper";

const API_BASE = "/api";

interface MusicContextType {
  handlePlayTrack: (trackId: number) => void;
}

export function FavoritesView() {
  const { handlePlayTrack } = useOutletContext<MusicContextType>();
  const navigate = useNavigate();
  
  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  
  const [favouriteTracks, setFavouriteTracks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavourites = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      openAuthModal();
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/favorites`, {
        method: "GET",
        credentials: "include", 
      });

      if (response.ok) {
        const data = await response.json();
        setFavouriteTracks(data);
      } else if (response.status === 401) {
        openAuthModal();
      }
    } catch (err) {
      console.error("Scriptify: Favorites fetch error", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, openAuthModal]);

  useEffect(() => {
    fetchFavourites();

    const handleAutoUpdate = () => fetchFavourites();
    window.addEventListener("favoriteUpdate", handleAutoUpdate);
    
    return () => window.removeEventListener("favoriteUpdate", handleAutoUpdate);
  }, [fetchFavourites]);

  const removeFavourite = async (musicId: number, title: string) => {
    try {
      const response = await fetch(`${API_BASE}/favorites/${musicId}`, {
        method: 'POST',
        credentials: "include",
      });

      if (response.ok) {
        setFavouriteTracks((prev) => prev.filter((track) => track.id !== musicId));
        toast.success(`Đã bỏ thích "${title}"`, {
          icon: <Heart className="w-4 h-4 text-muted-foreground" />
        });
        window.dispatchEvent(new Event("favoriteUpdate"));
      }
    } catch (err) {
      toast.error("Không thể cập nhật danh sách yêu thích");
    }
  };

  const filteredFavourites = useMemo(() => {
    return favouriteTracks.filter((track) => {
      const titleMatch = track.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const artistMatch = track.artist?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return titleMatch || artistMatch;
    });
  }, [searchQuery, favouriteTracks]);

  // Loading state đẹp mắt
  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center bg-background min-h-[70vh] transition-colors duration-300">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="flex-1 bg-background min-h-screen relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-primary/10 pointer-events-none blur-3xl opacity-50" />
        <div className="p-20 text-center relative z-10">
            <Music2 className="w-20 h-20 text-muted-foreground mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl font-black italic text-foreground uppercase tracking-tighter">Private Lounge</h2>
            <p className="text-muted-foreground font-bold mt-2">Vui lòng đăng nhập để xem kho nhạc cá nhân</p>
        </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background pb-32 custom-scrollbar transition-colors duration-300">
      <div className="pt-16 pb-8 px-8">
        <div className="flex flex-col md:flex-row items-end gap-8 mb-8">
          {/* Header Image/Icon */}
          <div className="w-52 h-52 bg-primary/20 rounded-3xl shadow-xl flex items-center justify-center flex-shrink-0 border border-primary/10 animate-in zoom-in duration-700 transition-colors">
            <Heart className="w-24 h-24 text-primary drop-shadow-md" fill="currentColor" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-3 italic font-sans">Personal Collection</p>
            <h2 className="text-6xl lg:text-8xl font-black text-foreground mb-6 tracking-tighter italic uppercase leading-none font-sans">Liked Songs</h2>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <img 
                  src={getResourceUrl(user?.avatarUrl)} 
                  className="w-7 h-7 rounded-full object-cover border border-border shadow-sm" 
                  alt="Avatar"
                  onError={(e) => e.currentTarget.src = "/assets/default-avatar.png"}
                />
                <span className="text-foreground font-black uppercase italic text-xs tracking-widest font-sans">
                  {user?.nickname || user?.username}
                </span>
              </div>
              <span className="text-muted-foreground font-bold">•</span>
              <span className="text-primary font-black italic uppercase text-xs tracking-widest font-sans">{favouriteTracks.length} Tracks</span>
            </div>
          </div>
        </div>

        <div className="relative mt-4 max-w-sm group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm trong kho lưu trữ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/50 border border-border text-foreground placeholder-muted-foreground rounded-xl py-3 pl-11 pr-6 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all text-sm italic font-sans shadow-sm"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="px-8 mt-4">
        <div className="grid grid-cols-[16px_4fr_3fr_1fr_48px] gap-4 px-4 py-2 border-b border-border text-muted-foreground text-[10px] font-black uppercase tracking-[0.25em] mb-4 italic font-sans">
          <div>#</div>
          <div>Giai điệu</div>
          <div>Nghệ sĩ</div>
          <div className="flex justify-center"><Clock3 className="w-4 h-4" /></div>
          <div></div>
        </div>

        {favouriteTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-secondary/20 rounded-[3rem] border border-dashed border-border">
            <Music2 className="w-16 h-16 text-muted-foreground/30 mb-4 animate-pulse" />
            <p className="text-muted-foreground/70 font-black uppercase text-[10px] tracking-[0.3em] leading-relaxed text-center italic font-sans">
              Cloud Library trống rỗng... <br/>
              <span className="text-muted-foreground">Thả tim ngay để lưu lại khoảnh khắc!</span>
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredFavourites.map((track, index) => (
              <div 
                key={track.id} 
                className="grid grid-cols-[16px_4fr_3fr_1fr_48px] gap-4 px-4 py-3 rounded-2xl hover:bg-accent transition-all group items-center border border-transparent hover:border-border"
              >
                <div className="text-muted-foreground font-black text-xs group-hover:text-primary transition-colors italic font-sans">
                   <span className="group-hover:hidden">{index + 1}</span>
                   <button onClick={() => handlePlayTrack(track.id)}>
                    <Play className="w-3.5 h-3.5 hidden group-hover:block fill-current text-primary cursor-pointer" />
                   </button>
                </div>
                
                <div className="flex items-center gap-4 min-w-0 font-sans">
                  <img 
                    src={getResourceUrl(track.imageUrl)} 
                    className="w-10 h-10 object-cover rounded-lg shadow-sm border border-border transition-transform group-hover:scale-110" 
                    alt={track.title}
                    onError={(e) => e.currentTarget.src = "/assets/default-cover.png"}
                  />
                  <div className="min-w-0 font-sans">
                    <h4 className="text-foreground font-black truncate text-sm uppercase tracking-tight italic group-hover:text-primary transition-colors">{track.title}</h4>
                    <p className="text-[9px] text-muted-foreground md:hidden font-black uppercase tracking-widest">{track.artist?.name}</p>
                  </div>
                </div>

                <div className="text-muted-foreground text-[10px] font-black uppercase tracking-widest truncate hidden md:block group-hover:text-foreground/70 transition-colors italic font-sans">
                  {track.artist?.name}
                </div>

                <div className="flex justify-center text-muted-foreground font-black text-[10px] tabular-nums font-sans">
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => removeFavourite(track.id, track.title)}
                    className="text-primary hover:scale-125 transition-all active:scale-75"
                    title="Bỏ thích"
                  >
                    <Heart className="w-5 h-5 fill-current" />
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