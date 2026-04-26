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
  
  // Lấy trạng thái từ Store toàn cục
  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  
  const [favouriteTracks, setFavouriteTracks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch danh sách Yêu thích
  const fetchFavourites = useCallback(async () => {
    // Nếu chưa đăng nhập, không fetch mà bật Modal ngay
    if (!user) {
      setIsLoading(false);
      openAuthModal(); // Gọi modal xịn từ Zustand
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

  // 2. Sync dữ liệu
  useEffect(() => {
    fetchFavourites();

    const handleAutoUpdate = () => fetchFavourites();
    window.addEventListener("favoriteUpdate", handleAutoUpdate);
    
    return () => window.removeEventListener("favoriteUpdate", handleAutoUpdate);
  }, [fetchFavourites]);

  // 3. Xử lý logic khi bỏ thích
  const removeFavourite = async (musicId: number, title: string) => {
    try {
      const response = await fetch(`${API_BASE}/favorites/${musicId}`, {
        method: 'POST',
        credentials: "include",
      });

      if (response.ok) {
        setFavouriteTracks((prev) => prev.filter((track) => track.id !== musicId));
        toast.success(`Đã bỏ thích "${title}"`, {
          icon: <Heart className="w-4 h-4 text-zinc-500" />
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
    <div className="flex-1 flex items-center justify-center bg-black min-h-[70vh]">
      <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
    </div>
  );

  // Nếu không có user, render giao diện trống mờ phía sau modal
  if (!user) return (
    <div className="flex-1 bg-black min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-black pointer-events-none blur-3xl opacity-50" />
        <div className="p-20 text-center relative z-10">
            <Music2 className="w-20 h-20 text-zinc-800 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl font-black italic text-zinc-800 uppercase tracking-tighter">Private Lounge</h2>
            <p className="text-zinc-900 font-bold mt-2">Vui lòng đăng nhập để xem kho nhạc cá nhân</p>
        </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-black pb-32 custom-scrollbar">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-green-900/40 to-black pt-16 pb-8 px-8">
        <div className="flex flex-col md:flex-row items-end gap-8 mb-8">
          <div className="w-52 h-52 bg-gradient-to-br from-green-400 to-green-700 rounded-3xl shadow-[0_20px_50px_rgba(34,197,94,0.2)] flex items-center justify-center flex-shrink-0 animate-in zoom-in duration-700">
            <Heart className="w-24 h-24 text-white drop-shadow-2xl" fill="currentColor" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-3 italic opacity-60 font-sans">Personal Collection</p>
            <h2 className="text-6xl lg:text-8xl font-black text-white mb-6 tracking-tighter italic uppercase leading-none font-sans">Liked Songs</h2>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <img 
                  src={getResourceUrl(user?.avatarUrl)} 
                  className="w-7 h-7 rounded-full object-cover border border-white/10 shadow-lg" 
                  alt="Avatar"
                  onError={(e) => e.currentTarget.src = "/assets/default-avatar.png"}
                />
                <span className="text-white font-black uppercase italic text-xs tracking-widest font-sans">
                  {user?.nickname || user?.username}
                </span>
              </div>
              <span className="text-zinc-800 font-bold">•</span>
              <span className="text-green-500 font-black italic uppercase text-xs tracking-widest font-sans">{favouriteTracks.length} Tracks</span>
            </div>
          </div>
        </div>

        <div className="relative mt-4 max-w-sm group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-green-500 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm trong kho lưu trữ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/5 text-white placeholder-zinc-700 rounded-xl py-3 pl-11 pr-6 focus:ring-1 focus:ring-green-500/30 focus:bg-white/10 outline-none transition-all text-sm italic font-sans"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="px-8 mt-4">
        <div className="grid grid-cols-[16px_4fr_3fr_1fr_48px] gap-4 px-4 py-2 border-b border-white/5 text-zinc-700 text-[10px] font-black uppercase tracking-[0.25em] mb-4 italic font-sans">
          <div>#</div>
          <div>Giai điệu</div>
          <div>Nghệ sĩ</div>
          <div className="flex justify-center"><Clock3 className="w-4 h-4" /></div>
          <div></div>
        </div>

        {favouriteTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/10 rounded-[3rem] border border-dashed border-zinc-900">
            <Music2 className="w-16 h-16 text-zinc-900 mb-4 animate-pulse" />
            <p className="text-zinc-700 font-black uppercase text-[10px] tracking-[0.3em] leading-relaxed text-center italic font-sans">
              Cloud Library trống rỗng... <br/>
              <span className="text-zinc-800">Thả tim ngay để lưu lại khoảnh khắc!</span>
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredFavourites.map((track, index) => (
              <div 
                key={track.id} 
                className="grid grid-cols-[16px_4fr_3fr_1fr_48px] gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all group items-center border border-transparent hover:border-white/5"
              >
                <div className="text-zinc-700 font-black text-xs group-hover:text-green-500 transition-colors italic font-sans">
                   <span className="group-hover:hidden">{index + 1}</span>
                   <button onClick={() => handlePlayTrack(track.id)}>
                    <Play className="w-3.5 h-3.5 hidden group-hover:block fill-green-500 text-green-500 cursor-pointer" />
                   </button>
                </div>
                
                <div className="flex items-center gap-4 min-w-0 font-sans">
                  <img 
                    src={getResourceUrl(track.imageUrl)} 
                    className="w-10 h-10 object-cover rounded-lg shadow-xl border border-white/5 transition-transform group-hover:scale-110" 
                    alt={track.title}
                    onError={(e) => e.currentTarget.src = "/assets/default-cover.png"}
                  />
                  <div className="min-w-0 font-sans">
                    <h4 className="text-white font-black truncate text-sm uppercase tracking-tight italic group-hover:text-green-400 transition-colors">{track.title}</h4>
                    <p className="text-[9px] text-zinc-600 md:hidden font-black uppercase tracking-widest">{track.artist?.name}</p>
                  </div>
                </div>

                <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest truncate hidden md:block group-hover:text-zinc-300 transition-colors italic font-sans">
                  {track.artist?.name}
                </div>

                <div className="flex justify-center text-zinc-700 font-black text-[10px] tabular-nums font-sans">
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => removeFavourite(track.id, track.title)}
                    className="text-green-500 hover:scale-125 transition-all active:scale-75 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]"
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