import { Play, Heart, Search, Loader2, LogIn, Music2, Clock3, Trash2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { getResourceUrl } from "@/utils/urlHelper";

const API_BASE = "http://localhost:8080/api";

interface MusicContextType {
  handlePlayTrack: (trackId: number) => void;
}

export function FavoritesView() {
  const { handlePlayTrack } = useOutletContext<MusicContextType>();
  const navigate = useNavigate();
  const { token, user } = useAuthStore(); // Dùng store của bồ cho đồng bộ
  
  const [favouriteTracks, setFavouriteTracks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fetchFavourites = async () => {
    if (!token) {
      setIsLoading(false);
      setShowAuthModal(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/favorites`, { // Đã khớp endpoint backend
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFavouriteTracks(data);
      } else if (response.status === 401) {
        setShowAuthModal(true);
      }
    } catch (err) {
      console.error("Lỗi fetch favs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, [token]);

  const removeFavourite = async (musicId: number, title: string) => {
    try {
      const response = await fetch(`${API_BASE}/favorites/${musicId}`, {
        method: 'POST',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        setFavouriteTracks((prev) => prev.filter((track) => track.id !== musicId));
        toast.success(`Đã bỏ thích "${title}"`);
        window.dispatchEvent(new Event("favoriteUpdate"));
      }
    } catch (err) {
      toast.error("Không thể bỏ thích bài hát này");
    }
  };

  useEffect(() => {
    fetchFavourites();
    
    const handleAutoUpdate = () => fetchFavourites();
    window.addEventListener("favoriteUpdate", handleAutoUpdate);
    
    return () => window.removeEventListener("favoriteUpdate", handleAutoUpdate);
  }, [token]);

  const filteredFavourites = useMemo(() => {
    return favouriteTracks.filter((track) => {
      const titleMatch = track.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const artistMatch = track.artist?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return titleMatch || artistMatch;
    });
  }, [searchQuery, favouriteTracks]);

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center bg-black min-h-screen">
      <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-black pb-32 custom-scrollbar">
      
      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase text-green-500">Phiên làm việc hết hạn</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Bồ cần đăng nhập để xem những bài hát đã "thả tim" nhé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button className="bg-green-500 text-black hover:bg-green-400 font-black uppercase rounded-xl w-full py-6" onClick={() => navigate("/login")}>
              <LogIn className="w-5 h-5 mr-2" /> Đăng nhập ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header Section */}
      <div className="bg-gradient-to-b from-green-900/40 to-black pt-16 pb-8 px-8">
        <div className="flex flex-col md:flex-row items-end gap-8 mb-8">
          <div className="w-52 h-52 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl shadow-2xl flex items-center justify-center flex-shrink-0 animate-in zoom-in duration-500">
            <Heart className="w-24 h-24 text-white drop-shadow-lg" fill="currentColor" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-white uppercase tracking-[0.3em] mb-3">Playlist</p>
            <h2 className="text-6xl lg:text-8xl font-black text-white mb-6 tracking-tighter italic uppercase">Liked Songs</h2>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <img 
                  src={getResourceUrl(user?.avatarUrl)} 
                  className="w-7 h-7 rounded-full object-cover border border-white/10" 
                  alt="Avatar"
                  onError={(e) => e.currentTarget.src = "/assets/default-avatar.png"}
                />
                <span className="text-white font-black uppercase italic text-xs">{user?.nickname || user?.username || "Thành viên"}</span>
              </div>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300 font-bold">{favouriteTracks.length} bài hát</span>
            </div>
          </div>
        </div>

        <div className="relative mt-4 max-w-sm group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-green-500 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm trong danh sách..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/5 text-white placeholder-zinc-600 rounded-xl py-3 pl-11 pr-6 focus:ring-1 focus:ring-green-500/50 focus:bg-white/10 outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Songs List Table */}
      <div className="px-8 mt-4">
        <div className="grid grid-cols-[16px_4fr_3fr_1fr_48px] gap-4 px-4 py-2 border-b border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">
          <div>#</div>
          <div>Tiêu đề</div>
          <div>Nghệ sĩ</div>
          <div className="flex justify-center"><Clock3 className="w-4 h-4" /></div>
          <div></div>
        </div>

        {favouriteTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Music2 className="w-16 h-16 text-zinc-800 mb-4 animate-pulse" />
            <p className="text-zinc-600 font-black uppercase text-xs tracking-widest leading-loose text-center">
              Chưa có bài hát nào được thả tim. <br/> Hãy khám phá vũ trụ Scriptify ngay!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredFavourites.map((track, index) => (
              <div 
                key={track.id} 
                className="grid grid-cols-[16px_4fr_3fr_1fr_48px] gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group items-center"
              >
                <div className="text-zinc-600 font-bold text-xs group-hover:text-green-500">
                   <span className="group-hover:hidden">{index + 1}</span>
                   <Play onClick={() => handlePlayTrack(track.id)} className="w-3.5 h-3.5 hidden group-hover:block fill-green-500 text-green-500 cursor-pointer" />
                </div>
                
                <div className="flex items-center gap-4 min-w-0">
                  <img 
                    src={getResourceUrl(track.imageUrl)} 
                    className="w-10 h-10 object-cover rounded-md shadow-lg" 
                    alt={track.title}
                    onError={(e) => e.currentTarget.src = "/assets/default-cover.png"}
                  />
                  <div className="min-w-0">
                    <h4 className="text-white font-bold truncate text-sm uppercase tracking-tight">{track.title}</h4>
                    <p className="text-xs text-zinc-500 md:hidden">{track.artist?.name}</p>
                  </div>
                </div>

                <div className="text-zinc-400 text-sm font-medium truncate hidden md:block group-hover:text-white transition-colors">
                  {track.artist?.name}
                </div>

                <div className="flex justify-center text-zinc-600 font-bold text-[11px]">
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => removeFavourite(track.id, track.title)}
                    className="text-green-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90"
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