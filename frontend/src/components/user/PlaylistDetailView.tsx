import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { Play, Heart, Loader2, ListMusic, Clock3, Share2, MoreHorizontal, Lock, Globe, Trash2 } from 'lucide-react';
import { getResourceUrl } from "@/utils/urlHelper";
import { apiRequest } from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

const API_BASE = "/api";

interface MusicContextType {
  handlePlayTrack: (trackId: number) => void;
}

export function PlaylistDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handlePlayTrack } = useOutletContext<MusicContextType>();
  const { user } = useAuthStore();
  
  const [playlist, setPlaylist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH DỮ LIỆU ---
  const fetchPlaylistDetails = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await apiRequest(`${API_BASE}/playlists/${id}`);
      if (data) {
        setPlaylist(data);
      }
    } catch (err) {
      console.error("Scriptify: Lỗi tải playlist", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlaylistDetails();
  }, [fetchPlaylistDetails]);

  // --- HÀM XÓA BÀI HÁT KHỎI PLAYLIST ---
  const handleRemoveSong = async (e: React.MouseEvent, songId: number, songTitle: string) => {
    e.stopPropagation(); // Ngăn không cho nhảy sang trang chi tiết bài hát
    if (!confirm(`Xóa "${songTitle}" khỏi playlist này?`)) return;

    try {
      // Gọi API xóa bài hát (Lưu ý: Chỉnh lại Endpoint cho khớp với Backend nếu cần)
      const res = await fetch(`${API_BASE}/playlists/${id}/songs/${songId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        toast.success(`Đã xóa "${songTitle}" khỏi playlist!`);
        // Cập nhật lại UI ngay lập tức (Optimistic Update)
        setPlaylist((prev: any) => ({
          ...prev,
          songs: prev.songs.filter((s: any) => s.id !== songId)
        }));
      } else {
        toast.error("Không thể xóa bài hát lúc này.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối đến máy chủ Cloud!");
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center bg-background min-h-[70vh] transition-colors duration-300">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  if (!playlist) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background min-h-[70vh]">
      <ListMusic className="w-20 h-20 text-muted-foreground/50 mb-4" />
      <h2 className="text-2xl font-black italic text-muted-foreground uppercase">Playlist không tồn tại</h2>
      <p className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.2em] mt-2 mb-6">Mã ID không có trên hệ thống Cloud</p>
      <Button variant="outline" className="rounded-xl" onClick={() => navigate(-1)}>Quay lại</Button>
    </div>
  );

  const coverImage = playlist.thumbnail || playlist.imageUrl;
  
  // Kiểm tra xem User đang đăng nhập có phải là chủ sở hữu Playlist không
  const isOwner = user && playlist.user && (user.nickname === playlist.user.nickname || user.username === playlist.user.username);

  return (
    <div className="flex-1 overflow-y-auto bg-background pb-32 custom-scrollbar transition-colors duration-300">
      
      {/* --- HEADER --- */}
      <div className="relative pt-20 pb-12 px-8 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10 blur-3xl scale-110 saturate-200 transition-all duration-1000"
          style={{ backgroundImage: `url(${getResourceUrl(coverImage)})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row items-end gap-10">
          <div className="w-52 h-52 md:w-64 md:h-64 bg-secondary rounded-3xl shadow-2xl flex items-center justify-center flex-shrink-0 border border-border overflow-hidden animate-in zoom-in duration-700">
            {coverImage ? (
              <img 
                src={getResourceUrl(coverImage)} 
                alt={playlist.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                onError={(e) => e.currentTarget.src = "/assets/default-cover.png"}
              />
            ) : (
              <ListMusic className="w-24 h-24 text-muted-foreground drop-shadow-md" />
            )}
          </div>

          <div className="flex-1 w-full animate-in slide-in-from-bottom-8 duration-700">
            <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4 italic font-sans flex items-center gap-2">
              Playlist <span className="text-primary">•</span> 
              {playlist.isPublic ? <Globe size={14} className="text-blue-400"/> : <Lock size={14} className="text-muted-foreground"/>}
              {playlist.isPublic ? "Công khai" : "Riêng tư"}
            </p>
            <h1 className="text-5xl lg:text-7xl font-black text-foreground mb-6 tracking-tighter italic uppercase leading-none font-sans line-clamp-2 drop-shadow-lg">
              {playlist.name}
            </h1>
            
            <div className="flex flex-col gap-4 text-sm mb-2">
              {playlist.description && (
                <p className="text-muted-foreground font-medium text-sm w-full">
                  {playlist.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-foreground font-black uppercase italic tracking-widest text-xs">
                Tạo bởi: <span className="text-primary">{playlist.user?.nickname || playlist.user?.username || "Người dùng"}</span>
                <span className="text-muted-foreground mx-2">•</span>
                <span className="text-muted-foreground">{playlist.songs?.length || 0} bài hát</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- ACTION BAR --- */}
      <div className="px-8 py-6 flex items-center gap-6 animate-in fade-in duration-1000 delay-300 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-20">
        <Button 
          onClick={() => playlist.songs?.[0] && handlePlayTrack(playlist.songs[0].id)}
          disabled={!playlist.songs?.length}
          className="w-16 h-16 rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(var(--primary),0.3)] flex items-center justify-center p-0 disabled:opacity-50"
        >
          <Play className="w-8 h-8 ml-1 fill-current" />
        </Button>
        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full border border-border hover:border-primary hover:text-primary transition-colors group">
          <Share2 className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full border border-border hover:border-primary hover:text-primary transition-colors group">
          <MoreHorizontal className="w-6 h-6" />
        </Button>
      </div>

      {/* --- TRACKLIST --- */}
      <div className="px-8 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
        <div className="grid grid-cols-[16px_4fr_3fr_1fr_80px] gap-4 px-4 py-2 border-b border-border text-muted-foreground text-[10px] font-black uppercase tracking-[0.25em] mb-4 italic">
          <div>#</div>
          <div>Giai điệu</div>
          <div>Nghệ sĩ</div>
          <div className="flex justify-center"><Clock3 className="w-4 h-4" /></div>
          <div></div>
        </div>

        {!playlist.songs || playlist.songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-secondary/20 rounded-[3rem] border border-dashed border-border">
            <ListMusic className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground/70 font-black uppercase text-[10px] tracking-[0.3em] text-center italic">
              Playlist này chưa có bài hát nào...
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {playlist.songs.map((track: any, index: number) => (
              <div 
                key={track.id} 
                className="grid grid-cols-[16px_4fr_3fr_1fr_80px] gap-4 px-4 py-3 rounded-2xl hover:bg-accent transition-all group items-center border border-transparent hover:border-border cursor-pointer"
                onClick={() => navigate(`/song/${track.id}`)}
              >
                <div className="text-muted-foreground font-black text-xs group-hover:text-primary transition-colors italic">
                   <span className="group-hover:hidden">{index + 1}</span>
                   <button onClick={(e) => { e.stopPropagation(); handlePlayTrack(track.id); }}>
                    <Play className="w-3.5 h-3.5 hidden group-hover:block fill-current text-primary cursor-pointer" />
                   </button>
                </div>
                
                <div className="flex items-center gap-4 min-w-0">
                  <img 
                    src={getResourceUrl(track.imageUrl)} 
                    className="w-10 h-10 object-cover rounded-lg shadow-sm border border-border" 
                    alt={track.title}
                    onError={(e) => e.currentTarget.src = "/assets/default-cover.png"}
                  />
                  <div className="min-w-0">
                    <h4 className="text-foreground font-black truncate text-sm uppercase tracking-tight italic group-hover:text-primary transition-colors">{track.title}</h4>
                  </div>
                </div>

                <div className="text-muted-foreground text-[10px] font-black uppercase tracking-widest truncate hidden md:block group-hover:text-foreground/70 transition-colors italic">
                  {track.artist?.name || "Unknown"}
                </div>

                <div className="flex justify-center text-muted-foreground font-black text-[10px] tabular-nums">
                  {track.duration ? formatDuration(track.duration) : "--:--"}
                </div>

                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                  <button onClick={(e) => e.stopPropagation()} className="p-2 text-muted-foreground hover:text-primary transition-colors" title="Thích">
                    <Heart className="w-4 h-4" />
                  </button>
                  
                  {/* Nút xóa: Chỉ hiện khi user là chủ sở hữu */}
                  {isOwner && (
                    <button 
                      onClick={(e) => handleRemoveSong(e, track.id, track.title)} 
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" 
                      title="Xóa khỏi Playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}