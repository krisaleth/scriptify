import { Play, Heart, Search, Loader2, AlertCircle, LogIn, Music2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'sonner'; // Dùng Sonner
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const API_BASE = "http://localhost:8080/api";

interface MusicContextType {
  handlePlayTrack: (trackId: number) => void;
}

export function FavoritesView() {
  const { handlePlayTrack } = useOutletContext<MusicContextType>();
  const navigate = useNavigate();
  
  const [favouriteTracks, setFavouriteTracks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fetchFavourites = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      setShowAuthModal(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/favorites`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFavouriteTracks(data);
      } else {
        if (response.status === 401) setShowAuthModal(true);
        setError("Không thể tải danh sách yêu thích");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, []);

  const removeFavourite = async (musicId: number, title: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE}/favorites/${musicId}`, {
        method: 'POST',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        // Cập nhật state local
        setFavouriteTracks((prev) => prev.filter((track) => track.id !== musicId));
        
        // Thông báo bằng Sonner
        toast.success(`Đã bỏ thích "${title}"`, {
          description: "Bài hát đã được xóa khỏi thư viện cá nhân.",
          style: { background: '#18181b', border: '1px solid #22c55e', color: '#fff' }
        });

        // Bắn event để Sidebar hoặc các component khác cập nhật theo
        window.dispatchEvent(new Event("favoriteUpdate"));
      }
    } catch (err) {
      toast.error("Không thể thực hiện hành động này");
    }
  };

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
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32 custom-scrollbar">
      
      {/* --- POPUP YÊU CẦU ĐĂNG NHẬP (Dùng chung logic với HomeView) --- */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic">Hết hạn phiên làm việc</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Bồ cần đăng nhập để xem danh sách bài hát đã thả tim nhé!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button 
              className="bg-green-500 text-black hover:bg-green-400 font-bold px-8 rounded-full w-full"
              onClick={() => navigate("/login")}
            >
              <LogIn className="w-4 h-4 mr-2" /> Đăng nhập ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- HEADER --- */}
      <div className="bg-gradient-to-b from-green-900/30 to-transparent pt-12 pb-8 px-8">
        <div className="flex flex-col md:flex-row items-end gap-6 mb-6">
          <div className="w-48 h-48 bg-gradient-to-br from-green-400 to-green-900 rounded-lg shadow-2xl flex items-center justify-center flex-shrink-0 animate-in fade-in zoom-in duration-500">
            <Heart className="w-24 h-24 text-white" fill="currentColor" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-2">Playlist</p>
            <h2 className="text-5xl lg:text-8xl font-black text-white mb-4 tracking-tighter italic">Liked Songs</h2>
            <div className="flex items-center gap-2 text-white font-medium">
              <span className="text-green-500">Krisaleth</span>
              <span className="text-zinc-400">•</span>
              <span>{favouriteTracks.length} bài hát</span>
            </div>
          </div>
        </div>
        
        <div className="relative mt-8 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
          <input
            type="text"
            placeholder="Tìm trong bài hát đã thích..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/40 text-white placeholder-zinc-500 rounded-full py-3 pl-12 pr-6 focus:ring-2 focus:ring-green-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* --- DANH SÁCH BÀI HÁT --- */}
      <div className="px-8 mt-4">
        {favouriteTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Music2 className="w-16 h-16 text-zinc-800 mb-4" />
            <p className="text-zinc-500 font-medium">Danh sách này đang trống.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredFavourites.map((track) => (
              <div key={track.id} className="bg-zinc-900/40 p-4 rounded-xl hover:bg-zinc-800/60 transition-all group relative border border-transparent hover:border-zinc-700 shadow-lg">
                <div className="relative mb-4 aspect-square">
                  <img 
                    src={track.imageUrl ? `${API_BASE}${track.imageUrl}` : "/default-cover.png"} 
                    className="w-full h-full object-cover rounded-lg shadow-md" 
                    alt={track.title}
                  />
                  <button
                    onClick={() => handlePlayTrack(track.id)}
                    className="absolute bottom-2 right-2 w-12 h-12 flex items-center justify-center bg-green-500 rounded-full shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all hover:scale-105"
                  >
                    <Play className="w-6 h-6 text-black fill-current ml-1" />
                  </button>
                </div>
                
                <h4 className="text-white font-bold truncate mb-1">{track.title}</h4>
                <p className="text-sm text-zinc-400 truncate mb-4">{track.artist?.name}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-bold">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </span>
                  <button
                    onClick={() => removeFavourite(track.id, track.title)}
                    className="text-green-500 hover:scale-110 transition-transform active:scale-90"
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