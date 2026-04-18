import { Play, Heart, Search, Loader2, AlertCircle } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

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
  const [songs, setSongs] = useState<Song[]>([]);
  const [favourites, setFavourites] = useState<number[]>([]); // Lưu danh sách ID bài hát đã thích
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  // 1. Fetch Dữ liệu (Nhạc + Trạng thái đã thích)
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        // Fetch đồng thời cả danh sách nhạc và danh sách yêu thích của User
        const [songsRes, favsRes] = await Promise.all([
          fetch(`${API_BASE}/songs?size=100`),
          fetch(`${API_BASE}/favorites`, {
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);

        if (songsRes.ok) {
          const data = await songsRes.json();
          setSongs(data.content || (Array.isArray(data) ? data : []));
        }

        if (favsRes.ok) {
          const favData = await favsRes.json();
          // Backend trả về Set<Song>, ta bóc tách lấy ID để dễ so sánh
          setFavourites(favData.map((s: any) => s.id));
        }
      } catch (err: any) {
        setError("Không thể kết nối tới server");
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [token]);

  // 2. Logic Toggle Tim (Lưu vào DB)
  const toggleFavourite = async (musicId: number) => {
    if (!token) {
      alert("Bồ cần đăng nhập để thả tim nhé!");
      return;
    }

    try {
      // Cập nhật UI trước (Optimistic Update) cho mượt
      const isCurrentlyFav = favourites.includes(musicId);
      if (isCurrentlyFav) {
        setFavourites(prev => prev.filter(id => id !== musicId));
      } else {
        setFavourites(prev => [...prev, musicId]);
      }

      // Gọi API Backend
      const res = await fetch(`${API_BASE}/favorites/${musicId}`, {
        method: 'POST',
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        // Nếu lỗi thì hoàn tác lại trạng thái UI
        fetch(`${API_BASE}/favorites`, {
          headers: { "Authorization": `Bearer ${token}` }
        }).then(r => r.json()).then(data => setFavourites(data.map((s: any) => s.id)));
        window.dispatchEvent(new Event("favoriteUpdate"));
      }
    } catch (err) {
      console.error("Lỗi toggle tim:", err);
    }
  };

  // Logic Filter & Popular
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
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32">
      <div className="bg-gradient-to-b from-green-900/20 to-transparent pt-12 pb-8 px-8">
        <h2 className="text-4xl font-bold text-white mb-2 italic">{greeting}</h2>
        <div className="relative mt-8 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài hát, nghệ sĩ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/80 text-white rounded-full py-3.5 pl-12 pr-6 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
      </div>

      <div className="px-8 mb-12">
        <h3 className="text-2xl font-bold text-white mb-6">Đang thịnh hành</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularTracks.map((track) => (
            <TrackCardHorizontal 
              key={track.id} 
              track={track} 
              isFav={favourites.includes(track.id)}
              onPlay={() => handlePlayTrack(track.id)}
              onToggleFav={() => toggleFavourite(track.id)}
            />
          ))}
        </div>
      </div>

      <div className="px-8">
        <h3 className="text-2xl font-bold text-white mb-6">Dành cho bồ</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMusic.map((track) => (
            <TrackCardVertical 
              key={track.id} 
              track={track} 
              isFav={favourites.includes(track.id)}
              onPlay={() => handlePlayTrack(track.id)}
              onToggleFav={() => toggleFavourite(track.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// COMPONENTS CON
function TrackCardHorizontal({ track, isFav, onPlay, onToggleFav }: any) {
  return (
    <div className="bg-zinc-800/30 rounded-lg p-3 hover:bg-zinc-700/40 transition group flex items-center gap-4">
      <div className="relative w-20 h-20 flex-shrink-0">
        <img src={`${API_BASE}${track.imageUrl}`} className="w-full h-full object-cover rounded-md" />
        <button onClick={onPlay} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-md">
          <Play className="w-8 h-8 text-white fill-current" />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-semibold truncate">{track.title}</h4>
        <p className="text-sm text-zinc-400 truncate">{track.artist?.name}</p>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFav(); }} 
          className={`mt-2 transition-transform active:scale-90 ${isFav ? 'text-green-500' : 'text-zinc-500 hover:text-white'}`}
        >
          <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
}

function TrackCardVertical({ track, isFav, onPlay, onToggleFav }: any) {
  return (
    <div className="bg-zinc-900/40 p-4 rounded-xl hover:bg-zinc-800/60 transition group">
      <div className="relative aspect-square mb-4">
        <img src={`${API_BASE}${track.imageUrl}`} className="w-full h-full object-cover rounded-lg shadow-lg" />
        <button onClick={onPlay} className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
          <Play className="w-6 h-6 text-black fill-current" />
        </button>
      </div>
      <h4 className="text-white font-bold truncate mb-1">{track.title}</h4>
      <div className="flex justify-between items-center">
        <p className="text-sm text-zinc-400 truncate">{track.artist?.name}</p>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFav(); }} 
          className={`transition-transform active:scale-90 ${isFav ? 'text-green-500' : 'text-zinc-500 hover:text-white'}`}
        >
          <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
}