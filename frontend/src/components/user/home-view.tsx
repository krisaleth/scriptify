import { Play, Heart, Search, Loader2, LogIn } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

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
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  
  // 1. LẤY TOKEN TỪ STORE (Để tự động cập nhật UI khi vừa Login xong)
  const token = useAuthStore((state) => state.token);
  
  const navigate = useNavigate();

  const [songs, setSongs] = useState<Song[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 2. FETCH DỮ LIỆU (Sẽ tự chạy lại mỗi khi token thay đổi)
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        const headers: any = token ? { "Authorization": `Bearer ${token}` } : {};
        
        const [songsRes, favsRes] = await Promise.all([
          fetch(`${API_BASE}/songs?size=100`),
          token ? fetch(`${API_BASE}/favorites`, { headers }) : Promise.resolve(null)
        ]);

        if (songsRes.ok) {
          const data = await songsRes.json();
          setSongs(data.content || (Array.isArray(data) ? data : []));
        }

        if (favsRes?.ok) {
          const favData = await favsRes.json();
          setFavorites(favData.map((s: any) => s.id));
        } else {
          // Nếu không có token hoặc lỗi fav, reset danh sách tim
          setFavorites([]);
        }
      } catch (err) {
        console.error("Lỗi kết nối server:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [token]);

  // 2. Logic Thả tim (Dùng Global Auth Modal)
  const toggleFavourite = async (musicId: number) => {
    if (!token) {
      openAuthModal(); // Hiện Popup đăng nhập toàn cục
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
        toast.success(isCurrentlyFav ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích", {
          style: { background: '#18181b', border: '1px solid #22c55e', color: '#fff' }
        });
        // Bắn event để Sidebar cập nhật
        window.dispatchEvent(new Event("favoriteUpdate"));
      } else {
        throw new Error();
      }
    } catch (err) {
      // Hoàn tác nếu lỗi
      setFavorites(prev => isCurrentlyFav ? [...prev, musicId] : prev.filter(id => id !== musicId));
      toast.error("Lỗi hệ thống khi cập nhật yêu thích");
    }
  };

  // 3. Logic Tìm kiếm & Phân loại
  const filteredMusic = useMemo(() => {
    return songs.filter((track) => 
      track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [songs, searchQuery]);

  const popularTracks = useMemo(() => {
    return [...songs].sort((a, b) => b.viewCount - a.viewCount).slice(0, 6);
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
      
      {/* HEADER & SEARCH */}
      <div className="bg-gradient-to-b from-green-900/30 to-transparent pt-12 pb-8 px-8">
        <h2 className="text-4xl font-black text-white mb-2 tracking-tighter italic">{greeting}</h2>
        <div className="relative mt-8 max-w-lg group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm bài hát, nghệ sĩ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/60 hover:bg-zinc-800 text-white rounded-full py-3.5 pl-12 pr-6 focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder:text-zinc-500 border-none"
          />
        </div>
      </div>

      {/* SECTION: ĐANG THỊNH HÀNH */}
      <div className="px-8 mb-12">
        <h3 className="text-2xl font-bold text-white mb-6">Đang thịnh hành</h3>
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

      {/* SECTION: DÀNH CHO BỒ */}
      <div className="px-8">
        <h3 className="text-2xl font-bold text-white mb-6">Dành cho bồ</h3>
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

// --- COMPONENTS HIỂN THỊ (Gộp chung trong 1 file để bồ dễ dùng) ---

function TrackCardHorizontal({ track, isFav, onPlay, onToggleFav }: any) {
  return (
    <div className="bg-zinc-900/40 rounded-md p-2 hover:bg-zinc-800/60 transition group flex items-center gap-4 cursor-pointer">
      <div className="relative w-16 h-16 flex-shrink-0">
        <img src={`${API_BASE}${track.imageUrl}`} className="w-full h-full object-cover rounded shadow-lg" alt={track.title} />
        <button 
          onClick={(e) => { e.stopPropagation(); onPlay(); }}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded shadow-xl"
        >
          <Play className="w-8 h-8 text-white fill-current" />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-bold truncate text-sm">{track.title}</h4>
        <p className="text-xs text-zinc-400 truncate">{track.artist?.name}</p>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onToggleFav(); }} 
        className={cn(
          "mr-4 transition-all active:scale-125",
          isFav ? "text-green-500" : "text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100"
        )}
      >
        <Heart className={cn("w-5 h-5", isFav && "fill-current")} />
      </button>
    </div>
  );
}

function TrackCardVertical({ track, isFav, onPlay, onToggleFav }: any) {
  return (
    <div className="bg-zinc-900/40 p-4 rounded-xl hover:bg-zinc-800/60 transition group cursor-pointer border border-transparent hover:border-zinc-800">
      <div className="relative aspect-square mb-4">
        <img src={`${API_BASE}${track.imageUrl}`} className="w-full h-full object-cover rounded-lg shadow-2xl" alt={track.title} />
        <button 
          onClick={(e) => { e.stopPropagation(); onPlay(); }}
          className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-2xl hover:scale-105"
        >
          <Play className="w-6 h-6 text-black fill-current ml-1" />
        </button>
      </div>
      <h4 className="text-white font-bold truncate mb-1">{track.title}</h4>
      <div className="flex justify-between items-center">
        <p className="text-sm text-zinc-400 truncate">{track.artist?.name}</p>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFav(); }} 
          className={cn(
            "transition-all active:scale-125",
            isFav ? "text-green-500" : "text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100"
          )}
        >
          <Heart className={cn("w-5 h-5", isFav && "fill-current")} />
        </button>
      </div>
    </div>
  );
}