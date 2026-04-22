import { Play, Heart, Search, Loader2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { getResourceUrl } from '@/utils/urlHelper';

const API_BASE = "http://localhost:8080/api";

interface MusicContextType {
  handlePlayTrack: (trackId: number) => void;
}

export interface Song {
  id: number;
  title: string;
  duration: number;
  imageUrl: string;
  viewCount: number;
  artist?: { name: string; };
}

export function HomeView() {
  const { handlePlayTrack } = useOutletContext<MusicContextType>();
  const { token, openAuthModal } = useAuthStore();

  const [songs, setSongs] = useState<Song[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 1. Hàm fetch danh sách yêu thích riêng biệt để đồng bộ
  const fetchOnlyFavorites = async () => {
    if (!token) {
      setFavorites([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/favorites`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const favData = await res.json();
        // Lưu mảng ID để check includes nhanh hơn
        setFavorites(favData.map((s: any) => s.id));
      }
    } catch (err) {
      console.error("Lỗi đồng bộ danh sách tim:", err);
    }
  };

  // 2. Init dữ liệu lần đầu
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        // Load danh sách bài hát (Public)
        const songsRes = await fetch(`${API_BASE}/songs?size=100`);
        if (songsRes.ok) {
          const data = await songsRes.json();
          setSongs(data.content || (Array.isArray(data) ? data : []));
        }
        // Load danh sách yêu thích (Private)
        await fetchOnlyFavorites();
      } catch (err) {
        console.error("Lỗi kết nối server:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [token]);

  // 3. Lắng nghe sự kiện để đồng bộ tim xanh từ các trang khác (Sidebar, FavoritesView)
  useEffect(() => {
    const handleAutoUpdate = () => fetchOnlyFavorites();
    window.addEventListener("favoriteUpdate", handleAutoUpdate);
    return () => window.removeEventListener("favoriteUpdate", handleAutoUpdate);
  }, [token]);

  // 4. Xử lý Like/Unlike
  const toggleFavourite = async (musicId: number) => {
    if (!token) {
      openAuthModal();
      return;
    }

    const isCurrentlyFav = favorites.includes(musicId);
    
    // Optimistic Update: Cập nhật UI ngay lập tức
    setFavorites(prev => 
      isCurrentlyFav ? prev.filter(id => id !== musicId) : [...prev, musicId]
    );

    try {
      const res = await fetch(`${API_BASE}/favorites/${musicId}`, {
        method: 'POST',
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success(isCurrentlyFav ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích");
        // Bắn event thông báo cho các component khác
        window.dispatchEvent(new Event("favoriteUpdate"));
      } else {
        throw new Error();
      }
    } catch (err) {
      // Hoàn tác nếu API lỗi
      setFavorites(prev => isCurrentlyFav ? [...prev, musicId] : prev.filter(id => id !== musicId));
      toast.error("Không thể cập nhật yêu thích");
    }
  };

  // Logic lọc và sắp xếp
  const filteredMusic = useMemo(() => {
    return songs.filter((track) => 
      track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [songs, searchQuery]);

  const popularTracks = useMemo(() => {
    return [...songs].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 6);
  }, [songs]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  }, []);

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center bg-black min-h-screen">
      <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32 custom-scrollbar">
      
      {/* Search & Greeting Section */}
      <div className="bg-gradient-to-b from-green-900/30 to-transparent pt-12 pb-8 px-8">
        <h2 className="text-4xl font-black text-white mb-2 tracking-tighter italic uppercase">{greeting}</h2>
        <div className="relative mt-8 max-w-lg group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm bài hát, nghệ sĩ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/60 hover:bg-zinc-800 text-white rounded-full py-4 pl-12 pr-6 focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder:text-zinc-600 border-none shadow-2xl"
          />
        </div>
      </div>

      {/* Popular Section */}
      <div className="px-8 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white italic tracking-tight uppercase">Đang thịnh hành</h3>
          <div className="h-[1px] flex-1 bg-white/5 ml-6"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularTracks.map((track) => (
            <TrackCardHorizontal 
              key={track.id} 
              track={track} 
              isFav={favorites.includes(track.id)}
              onPlay={() => handlePlayTrack(track.id)}
              onToggleFav={() => toggleFavourite(track.id)}
            />
          ))}
        </div>
      </div>

      {/* All Music Section */}
      <div className="px-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white italic tracking-tight uppercase">Dành cho bồ</h3>
          <div className="h-[1px] flex-1 bg-white/5 ml-6"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMusic.map((track) => (
            <TrackCardVertical 
              key={track.id} 
              track={track} 
              isFav={favorites.includes(track.id)}
              onPlay={() => handlePlayTrack(track.id)}
              onToggleFav={() => toggleFavourite(track.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TrackCardHorizontal({ track, isFav, onPlay, onToggleFav }: any) {
  return (
    <div 
      onClick={onPlay}
      className="bg-zinc-900/40 rounded-xl p-3 hover:bg-zinc-800/60 transition-all group flex items-center gap-4 cursor-pointer border border-transparent hover:border-zinc-800 shadow-lg"
    >
      <div className="relative w-16 h-16 flex-shrink-0">
        <img 
          src={getResourceUrl(track.imageUrl)} 
          className="w-full h-full object-cover rounded-lg shadow-md" 
          alt={track.title}
          onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg">
          <Play className="w-8 h-8 text-white fill-current" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-bold truncate text-sm uppercase italic tracking-tight">{track.title}</h4>
        <p className="text-[11px] text-zinc-500 truncate font-medium">{track.artist?.name}</p>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onToggleFav(); }} 
        className={cn(
          "mr-4 transition-all active:scale-150 p-2",
          isFav ? "text-green-500 scale-110" : "text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100"
        )}
      >
        <Heart className={cn("w-5 h-5", isFav && "fill-current")} />
      </button>
    </div>
  );
}

function TrackCardVertical({ track, isFav, onPlay, onToggleFav }: any) {
  return (
    <div 
      onClick={onPlay}
      className="bg-zinc-900/40 p-4 rounded-2xl hover:bg-zinc-800/60 transition-all group cursor-pointer border border-transparent hover:border-zinc-700/30 flex flex-col h-full shadow-xl"
    >
      <div className="relative aspect-square mb-4 overflow-hidden rounded-xl">
        <img 
          src={getResourceUrl(track.imageUrl)} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 shadow-2xl" 
          alt={track.title}
          onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")}
        />
        <div className="absolute bottom-3 right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-2xl hover:scale-110 shadow-green-500/40">
          <Play className="w-6 h-6 text-black fill-current ml-1" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-bold truncate mb-1 text-base uppercase italic tracking-tighter">{track.title}</h4>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-zinc-500 truncate font-medium">{track.artist?.name}</p>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFav(); }} 
            className={cn(
              "transition-all active:scale-150 p-1",
              isFav ? "text-green-500" : "text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100"
            )}
          >
            <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
          </button>
        </div>
      </div>
    </div>
  );
}