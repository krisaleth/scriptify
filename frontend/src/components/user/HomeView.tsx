import { Play, Heart, Search, Loader2, Sparkles, ChevronRight, ChevronLeft, Eye } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { getResourceUrl } from '@/utils/urlHelper';
import { Song, MusicContextType } from '@/types/song';

const API_BASE = "/api";

export function HomeView() {
  const { handlePlayTrack } = useOutletContext<MusicContextType>();
  const { user, openAuthModal } = useAuthStore();

  const [songs, setSongs] = useState<Song[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      sliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const fetchOnlyFavorites = useCallback(async () => {
    if (!user) { setFavorites([]); return; }
    try {
      const res = await fetch(`${API_BASE}/favorites`, { credentials: "include" });
      if (res.ok) {
        const favData = await res.json();
        setFavorites(favData.map((s: any) => Number(s.id)));
      }
    } catch (err) { console.error("Scriptify Favorites Error:", err); }
  }, [user]);

  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        const songsRes = await fetch(`${API_BASE}/songs?size=100`, { credentials: "include" });
        if (songsRes.ok) {
          const data = await songsRes.json();
          setSongs(data.content || (Array.isArray(data) ? data : []));
        }
        if (user) await fetchOnlyFavorites();
      } catch (err) { console.error("Scriptify Init Error:", err); }
      finally { setIsLoading(false); }
    };
    initData();
  }, [user, fetchOnlyFavorites]);

  const toggleFavourite = async (musicId: number) => {
    if (!user) return openAuthModal();
    const idNum = Number(musicId);
    const isCurrentlyFav = favorites.includes(idNum);

    setFavorites(prev => isCurrentlyFav ? prev.filter(id => id !== idNum) : [...prev, idNum]);
    setSongs(prev => prev.map(s => s.id === idNum ? { 
      ...s, likeCount: isCurrentlyFav ? (s.likeCount - 1) : (s.likeCount + 1) 
    } : s));

    try {
      const res = await fetch(`${API_BASE}/favorites/${idNum}`, {
        method: 'POST', credentials: "include",
      });
      if (res.ok) window.dispatchEvent(new Event("favoriteUpdate"));
    } catch (err) {
      fetchOnlyFavorites();
      toast.error("Lỗi cập nhật yêu thích!");
    }
  };

  const filteredMusic = useMemo(() => songs.filter(s => 
    s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.artist?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ), [songs, searchQuery]);

  const popularTracks = useMemo(() => 
    [...songs]
      .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      .slice(0, 3)
  , [songs]);

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
    <div className="flex-1 overflow-y-auto bg-black pb-40 custom-scrollbar select-none overflow-x-hidden">
      
      {/* 🟢 HEADER */}
      <div className="bg-gradient-to-b from-green-900/20 to-transparent pt-16 pb-12 px-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-green-500 animate-pulse" />
          <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase">{greeting}</h2>
        </div>
        
        <div className="relative mt-10 max-w-xl group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-green-500 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm giai điệu bồ yêu thích..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/40 text-white rounded-2xl py-5 pl-14 pr-8 outline-none border border-white/5 focus:border-green-500/20 transition-all font-bold italic shadow-2xl backdrop-blur-sm"
          />
        </div>
      </div>

      {/* 🟢 THỊNH HÀNH (TOP 3) */}
      <div className="px-8 mb-20">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-4">
            Thịnh hành <div className="h-px w-20 bg-gradient-to-r from-green-500 to-transparent"></div>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularTracks.map((track, idx) => (
            <div key={track.id} className="relative group">
               <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-500 text-black text-xs font-black flex items-center justify-center rounded-full z-20 italic shadow-[0_0_15px_rgba(34,197,94,0.5)] border-2 border-black">
                 #{idx + 1}
               </div>
               <TrackCardHorizontal 
                track={track} 
                isFav={favorites.includes(Number(track.id))}
                onPlay={() => handlePlayTrack(track.id)}
                onToggleFav={() => toggleFavourite(track.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 🟢 DÀNH RIÊNG CHO BỒ (SLIDER) */}
      <div className="px-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Dành riêng cho bồ</h3>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-green-500 hover:border-green-500/20 transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-green-500 hover:border-green-500/20 transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div ref={sliderRef} className="flex overflow-x-auto gap-6 pb-12 no-scrollbar snap-x snap-mandatory scroll-smooth">
          {filteredMusic.map(track => (
            <div key={track.id} className="flex-none w-[180px] md:w-[220px] snap-start">
              <TrackCardVertical 
                track={track} 
                isFav={favorites.includes(Number(track.id))}
                onPlay={() => handlePlayTrack(track.id)}
                onToggleFav={() => toggleFavourite(track.id)}
              />
            </div>
          ))}
          <div className="flex-none w-10 h-full" />
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TrackCardHorizontal({ track, isFav, onPlay, onToggleFav }: any) {
  return (
    <div className="group bg-zinc-900/20 rounded-2xl p-4 hover:bg-zinc-800/40 transition-all duration-500 flex items-center gap-5 cursor-pointer border border-white/5 hover:border-green-500/20 shadow-xl relative overflow-hidden">
      <div className="relative w-16 h-16 flex-shrink-0" onClick={onPlay}>
        <img 
          src={getResourceUrl(track.imageUrl)} 
          className="w-full h-full object-cover rounded-xl shadow-lg border border-white/5" 
          alt={track.title} 
          onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")} 
        />
        {/* Nút Play xanh đặc trưng của Scriptify */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all rounded-xl backdrop-blur-[1px]">
          <Play className="w-8 h-8 text-green-500 fill-current drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
        </div>
      </div>
      <div className="flex-1 min-w-0" onClick={onPlay}>
        <h4 className="text-white font-black truncate text-sm uppercase italic tracking-tight mb-1 group-hover:text-green-400 transition-colors">{track.title}</h4>
        <p className="text-[10px] text-zinc-600 truncate font-black uppercase tracking-widest">{track.artist?.name}</p>
      </div>
      
      <div className="flex flex-col items-center min-w-[35px]">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFav(); }} 
          className={cn("transition-all active:scale-150 p-2", isFav ? "text-green-500" : "text-zinc-700 hover:text-zinc-400")}
        >
          <Heart className={cn("w-6 h-6", isFav && "fill-current")} />
        </button>
        <span className={cn("text-[10px] font-black", isFav ? "text-green-500" : "text-zinc-800")}>
          {track.likeCount || 0}
        </span>
      </div>
    </div>
  );
}

function TrackCardVertical({ track, isFav, onPlay, onToggleFav }: any) {
  return (
    <div className="group relative bg-zinc-900/20 p-5 rounded-[2.5rem] hover:bg-zinc-800/40 transition-all duration-500 cursor-pointer border border-transparent hover:border-green-500/20 shadow-2xl overflow-hidden active:scale-95">
      
      <div className="relative aspect-square mb-5 overflow-hidden rounded-[1.5rem] shadow-2xl" onClick={onPlay}>
        <img 
          src={getResourceUrl(track.imageUrl)} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
          alt={track.title} 
          onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")} 
        />
        
        {/* Nút Play xanh - Glowing Effect */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
           <button className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:scale-110 transition-transform translate-y-3 group-hover:translate-y-0 duration-500">
              <Play size={28} fill="currentColor" className="ml-1" />
           </button>
        </div>
      </div>
      
      <h4 className="text-white font-black truncate mb-2 text-base uppercase italic tracking-tighter group-hover:text-green-500 transition-colors">
        {track.title}
      </h4>
      
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-zinc-600 truncate font-black uppercase tracking-[0.1em] max-w-[55%] italic">{track.artist?.name}</p>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFav(); }} 
          className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all active:scale-125 shadow-lg", 
            isFav 
              ? "bg-green-500/10 border-green-500/30 text-green-500" 
              : "bg-black/40 border-white/5 text-zinc-700 hover:text-zinc-400"
          )}
        >
          <span className="text-[10px] font-black">{track.likeCount || 0}</span>
          <Heart className={cn("w-3.5 h-3.5", isFav && "fill-current")} />
        </button>
      </div>
    </div>
  );
}