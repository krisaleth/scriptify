import { Play, Heart, Search, Loader2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { getResourceUrl } from '@/utils/urlHelper';
import { Song, MusicContextType } from '@/types/song';

const API_BASE = "http://localhost:8080/api";

export function HomeView() {
  const { handlePlayTrack } = useOutletContext<MusicContextType>();
  const { token, openAuthModal } = useAuthStore();

  const [songs, setSongs] = useState<Song[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Hàm fetch danh sách yêu thích để đồng bộ Tim xanh
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
        // Ép kiểu về Number để so sánh chính xác tuyệt đối
        setFavorites(favData.map((s: any) => Number(s.id)));
      }
    } catch (err) { 
      console.error("Lỗi fetch favorites:", err); 
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        const songsRes = await fetch(`${API_BASE}/songs?size=100`);
        if (songsRes.ok) {
          const data = await songsRes.json();
          setSongs(data.content || (Array.isArray(data) ? data : []));
        }
        // Luôn fetch favs sau khi load songs nếu có token
        if (token) await fetchOnlyFavorites();
      } finally { 
        setIsLoading(false); 
      }
    };
    initData();
  }, [token]); // Chạy lại khi login/logout để cập nhật đúng user

  // ĐỒNG BỘ: Nghe sự kiện cập nhật từ Sidebar/FavoritesView
  useEffect(() => {
    const sync = () => fetchOnlyFavorites();
    window.addEventListener("favoriteUpdate", sync);
    return () => window.removeEventListener("favoriteUpdate", sync);
  }, [token]);

  const toggleFavourite = async (musicId: number) => {
    if (!token) return openAuthModal();
    
    const idNum = Number(musicId);
    const isCurrentlyFav = favorites.includes(idNum);

    // Optimistic Update: Cập nhật UI ngay lập tức
    setFavorites(prev => isCurrentlyFav ? prev.filter(id => id !== idNum) : [...prev, idNum]);
    setSongs(prev => prev.map(s => s.id === idNum ? { ...s, likeCount: isCurrentlyFav ? (s.likeCount - 1) : (s.likeCount + 1) } : s));

    try {
      const res = await fetch(`${API_BASE}/favorites/${idNum}`, {
        method: 'POST',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        window.dispatchEvent(new Event("favoriteUpdate"));
      } else {
        throw new Error();
      }
    } catch (err) {
      fetchOnlyFavorites(); // Revert nếu lỗi
      toast.error("Không thể cập nhật yêu thích");
    }
  };

  const filteredMusic = useMemo(() => songs.filter(s => 
    s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.artist?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ), [songs, searchQuery]);

  const popularTracks = useMemo(() => [...songs].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 6), [songs]);

  const greeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Chào buổi sáng";
    if (hr < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  }, []);

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center bg-black min-h-screen">
      <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32 custom-scrollbar">
      <div className="bg-gradient-to-b from-green-900/30 to-transparent pt-12 pb-8 px-8">
        <h2 className="text-4xl font-black text-white mb-2 tracking-tighter italic">{greeting}</h2>
        <div className="relative mt-8 max-w-lg group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm bài hát, nghệ sĩ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/40 text-white rounded-full py-3.5 pl-12 pr-6 focus:ring-2 focus:ring-green-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="px-8 mb-12">
        <h3 className="text-2xl font-bold text-white mb-6 italic tracking-tight">Đang thịnh hành</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularTracks.map(track => (
            <TrackCardHorizontal 
              key={track.id} 
              track={track} 
              isFav={favorites.includes(Number(track.id))}
              onPlay={() => handlePlayTrack(track.id)}
              onToggleFav={() => toggleFavourite(track.id)}
            />
          ))}
        </div>
      </div>

      <div className="px-8">
        <h3 className="text-2xl font-bold text-white mb-6 italic tracking-tight">Dành cho bồ</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMusic.map(track => (
            <TrackCardVertical 
              key={track.id} 
              track={track} 
              isFav={favorites.includes(Number(track.id))}
              onPlay={() => handlePlayTrack(track.id)}
              onToggleFav={() => toggleFavourite(track.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTS CON ---

function TrackCardHorizontal({ track, isFav, onPlay, onToggleFav }: any) {
  return (
    <div className="bg-zinc-900/40 rounded-xl p-3 hover:bg-zinc-800/60 transition-all group flex items-center gap-4 cursor-pointer border border-transparent hover:border-zinc-800 shadow-md">
      <div className="relative w-16 h-16 flex-shrink-0" onClick={onPlay}>
        <img src={getResourceUrl(track.imageUrl)} className="w-full h-full object-cover rounded-lg shadow-lg" alt={track.title} onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")} />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg">
          <Play className="w-8 h-8 text-white fill-current" />
        </div>
      </div>
      <div className="flex-1 min-w-0" onClick={onPlay}>
        <h4 className="text-white font-bold truncate text-sm uppercase italic">{track.title}</h4>
        <p className="text-xs text-zinc-400 truncate">{track.artist?.name}</p>
      </div>
      
      {/* Nút tim và số like luôn hiển thị, không cần hover */}
      <div className="flex flex-col items-center mr-2 min-w-[32px]">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFav(); }} 
          className={cn("transition-all active:scale-150 p-1", isFav ? "text-green-500" : "text-zinc-500 hover:text-zinc-300")}
        >
          <Heart className={cn("w-5 h-5", isFav && "fill-current")} />
        </button>
        <span className={cn("text-[10px] font-bold mt-0.5", isFav ? "text-green-500" : "text-zinc-600")}>
          {track.likeCount || 0}
        </span>
      </div>
    </div>
  );
}

function TrackCardVertical({ track, isFav, onPlay, onToggleFav }: any) {
  return (
    <div className="bg-zinc-900/40 p-4 rounded-2xl hover:bg-zinc-800/60 transition-all group cursor-pointer border border-transparent hover:border-zinc-700/30 shadow-lg">
      <div className="relative aspect-square mb-4 overflow-hidden rounded-xl" onClick={onPlay}>
        <img src={getResourceUrl(track.imageUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={track.title} onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")} />
        <button className="absolute bottom-3 right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl hover:scale-110">
          <Play className="w-6 h-6 text-black fill-current ml-1" />
        </button>
      </div>
      <h4 className="text-white font-bold truncate mb-1 text-base uppercase italic tracking-tight">{track.title}</h4>
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-zinc-400 truncate font-medium max-w-[60%]">{track.artist?.name}</p>
        <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-full">
          <span className={cn("text-[10px] font-bold", isFav ? "text-green-500" : "text-zinc-500")}>
            {track.likeCount || 0}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFav(); }} 
            className={cn("transition-all active:scale-150", isFav ? "text-green-500" : "text-zinc-500 hover:text-zinc-300")}
          >
            <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
          </button>
        </div>
      </div>
    </div>
  );
}