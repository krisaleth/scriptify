import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Play, Heart, Loader2, Music2, Clock3, Eye, CalendarDays, ListPlus, X } from 'lucide-react';
import { getResourceUrl } from "@/utils/urlHelper";
import { apiRequest } from "@/utils/apiClient";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

const API_BASE = "/api";

interface MusicContextType {
  handlePlayTrack: (trackId: number) => void;
}

export function SongDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handlePlayTrack } = useOutletContext<MusicContextType>();
  const { user, openAuthModal } = useAuthStore();
  
  const [song, setSong] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE CHO MODAL THÊM VÀO PLAYLIST ---
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [myPlaylists, setMyPlaylists] = useState<any[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);

  // --- FETCH DATA ---
  const fetchSongDetails = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await apiRequest(`${API_BASE}/songs/${id}`);
      if (data) setSong(data);
    } catch (err) {
      console.error("Scriptify: Lỗi tải chi tiết bài hát", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSongDetails();
  }, [fetchSongDetails]);

  // --- HÀM LẤY DANH SÁCH PLAYLIST CỦA USER ---
  const handleOpenPlaylistModal = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setIsPlaylistModalOpen(true);
    setIsLoadingPlaylists(true);
    try {
      const res = await fetch(`${API_BASE}/playlists/me`, { credentials: "include" });
      if (res.ok) {
        setMyPlaylists(await res.json());
      } else {
        toast.error("Không thể tải danh sách Playlist của bạn.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối máy chủ Cloud.");
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  // --- HÀM THÊM BÀI HÁT VÀO PLAYLIST CHỈ ĐỊNH ---
  const handleAddToPlaylist = async (playlistId: number, playlistName: string) => {
    try {
      const res = await fetch(`${API_BASE}/playlists/${playlistId}/songs/${song.id}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success(`Đã thêm vào "${playlistName}"`);
        setIsPlaylistModalOpen(false);
      } else {
        toast.error("Bài hát này đã có trong Playlist rồi!");
      }
    } catch (err) {
      toast.error("Lỗi kết nối đến máy chủ.");
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Không rõ";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center bg-background min-h-[70vh] transition-colors duration-300">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  if (!song) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background min-h-[70vh]">
      <Music2 className="w-20 h-20 text-muted-foreground/50 mb-4 animate-pulse" />
      <h2 className="text-2xl font-black italic text-muted-foreground uppercase">Giai điệu không tồn tại</h2>
      <button 
        className="mt-4 px-6 py-2 rounded-xl border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-all font-bold uppercase tracking-widest text-[10px]" 
        onClick={() => navigate(-1)}
      >
        Quay lại
      </button>
    </div>
  );

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-background pb-32 custom-scrollbar transition-colors duration-300">
        
        <div className="relative pt-20 pb-12 px-8 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-10 blur-3xl scale-110 saturate-200 transition-all duration-1000"
            style={{ backgroundImage: `url(${getResourceUrl(song.imageUrl)})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

          <div className="relative z-10 flex flex-col md:flex-row items-end gap-10">
            <div className="w-64 h-64 bg-secondary rounded-3xl shadow-2xl flex items-center justify-center flex-shrink-0 border border-border overflow-hidden animate-in zoom-in duration-700">
              {song.imageUrl ? (
                <img 
                  src={getResourceUrl(song.imageUrl)} 
                  alt={song.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(e) => e.currentTarget.src = "/assets/default-cover.png"}
                />
              ) : (
                <Music2 className="w-24 h-24 text-muted-foreground drop-shadow-md" />
              )}
            </div>

            <div className="flex-1 w-full animate-in slide-in-from-bottom-8 duration-700">
              <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4 italic font-sans flex items-center gap-2">
                Single <span className="text-primary">•</span> {song.albumTitle || "Không thuộc Album"}
              </p>
              <h1 className="text-6xl lg:text-8xl font-black text-foreground mb-6 tracking-tighter italic uppercase leading-none font-sans line-clamp-2 drop-shadow-lg">
                {song.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm mb-6">
                <div className="flex items-center gap-2 text-foreground font-black uppercase italic tracking-widest text-lg hover:text-primary transition-colors cursor-pointer">
                  {song.artist?.name || "Nghệ sĩ ẩn danh"}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
                <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border backdrop-blur-sm">
                  <Clock3 size={12} className="text-primary" /> {formatDuration(song.duration)}
                </div>
                <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border backdrop-blur-sm">
                  <Eye size={12} className="text-blue-500" /> {song.viewCount?.toLocaleString() || 0} Lượt xem
                </div>
                <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border backdrop-blur-sm">
                  <Heart size={12} className="text-red-500" /> {song.likeCount?.toLocaleString() || 0} Lượt thích
                </div>
                <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border backdrop-blur-sm">
                  <CalendarDays size={12} /> {formatDate(song.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 flex items-center gap-6 animate-in fade-in duration-1000 delay-300 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-20">
          <button 
            onClick={() => handlePlayTrack(song.id)}
            className="w-16 h-16 rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(var(--primary),0.3)] flex items-center justify-center p-0"
          >
            <Play className="w-8 h-8 ml-1 fill-current" />
          </button>
          <button 
            className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-red-500 hover:text-red-500 transition-colors group" 
            title="Yêu thích"
          >
            <Heart className="w-6 h-6 group-hover:fill-current" />
          </button>
          
          {/* NÚT THÊM VÀO PLAYLIST */}
          <button 
            onClick={handleOpenPlaylistModal}
            className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors" 
            title="Thêm vào Playlist"
          >
            <ListPlus className="w-6 h-6" />
          </button>
        </div>

        {song.description && (
          <div className="px-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 w-full">
            <h3 className="text-xl font-black italic uppercase tracking-tight text-foreground mb-4">
              <span className="text-primary mr-2">#</span>Mô tả
            </h3>
            <div className="bg-secondary/20 border border-border rounded-3xl p-8 backdrop-blur-sm">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium text-sm">
                {song.description}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* --- MODAL DANH SÁCH PLAYLIST --- */}
      {isPlaylistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsPlaylistModalOpen(false)} 
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive transition-colors bg-secondary/50 rounded-full"
            >
               <X size={16} />
            </button>
            <h3 className="text-xl font-black italic uppercase mb-6 text-foreground text-center tracking-tighter">Lưu vào Playlist</h3>
            
            <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
              {isLoadingPlaylists ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : myPlaylists.length > 0 ? (
                myPlaylists.map((pl) => (
                  <div 
                    key={pl.id} 
                    onClick={() => handleAddToPlaylist(pl.id, pl.name)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary border border-transparent hover:border-primary/30 cursor-pointer transition-all group"
                  >
                    <img 
                      src={getResourceUrl(pl.thumbnailUrl || pl.imageUrl)} 
                      alt={pl.name}
                      className="w-12 h-12 object-cover rounded-lg bg-background border border-border group-hover:scale-105 transition-transform"
                      onError={(e) => e.currentTarget.src = "/assets/default-cover.png"}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm uppercase italic truncate group-hover:text-primary transition-colors">{pl.name}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{pl.songs?.length || 0} Tracks</p>
                    </div>
                    <ListPlus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Music2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest italic">Bạn chưa có Playlist nào.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}