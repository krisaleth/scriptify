import { ArrowLeft, Play, Heart, Loader2, Music, Trash2, Globe, Lock } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { getResourceUrl } from '@/utils/urlHelper';
import { apiRequest } from '@/utils/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
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

  const fetchPlaylistDetails = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await apiRequest(`${API_BASE}/playlists/${id}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (data) setPlaylist(data);
    } catch (err) {
      console.error("Scriptify: Lỗi tải playlist", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlaylistDetails();
  }, [fetchPlaylistDetails]);

  const handleRemoveSong = async (e: React.MouseEvent, songId: number, songTitle: string) => {
    e.stopPropagation(); 
    if (!confirm(`Xóa "${songTitle}" khỏi playlist này?`)) return;

    try {
      const res = await fetch(`${API_BASE}/playlists/${id}/songs/${songId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        toast.success(`Đã xóa "${songTitle}" khỏi playlist!`);
        setPlaylist((prev: any) => ({
          ...prev,
          songs: prev.songs.filter((s: any) => s.id !== songId),
          songCount: (prev.songCount || 1) - 1
        }));
      } else {
        toast.error("Không thể xóa bài hát lúc này sếp ơi.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối đến máy chủ Cloud!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background transition-colors duration-300">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background gap-4 p-8 text-center min-h-[70vh] transition-colors duration-300">
        <p className="text-muted-foreground text-xl font-bold uppercase tracking-widest italic">Playlist này không tồn tại trong hệ thống!</p>
        <button onClick={() => navigate(-1)} className="text-primary hover:text-primary/80 font-black transition-all uppercase underline decoration-primary/30 underline-offset-8">
          ← Quay lại
        </button>
      </div>
    );
  }

  const coverImage = playlist.thumbnailUrl;
  const isOwner = user && playlist.userNickname && (user.nickname === playlist.userNickname || user.username === playlist.userNickname);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-muted/30 to-background pb-32 custom-scrollbar transition-colors duration-300">
      <div className="bg-gradient-to-b from-primary/10 to-transparent px-8 pt-8 pb-8 transition-colors duration-300">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group bg-secondary/50 w-fit px-4 py-1.5 rounded-full border border-border"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase italic">Quay lại</span>
        </button>

        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 max-w-6xl mx-auto">
          <div className="w-64 h-64 flex-shrink-0 shadow-2xl rounded-3xl overflow-hidden group border border-border transition-colors bg-secondary flex items-center justify-center">
            {coverImage ? (
              <img
                src={getResourceUrl(coverImage)}
                alt={playlist.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")}
              />
            ) : (
              <Music className="w-24 h-24 text-muted-foreground drop-shadow-md" />
            )}
          </div>
          
          <div className="flex flex-col items-center md:items-start flex-1 w-full">
            <p className="text-[10px] font-black text-primary mb-2 uppercase tracking-[0.4em] italic transition-colors flex items-center gap-2">
              Playlist 
              <span className="text-muted-foreground">•</span>
              {playlist.public ? <Globe size={12} className="text-blue-400"/> : <Lock size={12} className="text-muted-foreground"/>}
              <span className="text-muted-foreground">{playlist.public ? "Công khai" : "Riêng tư"}</span>
            </p>
            <h1 className="text-5xl md:text-7xl font-black text-foreground mb-4 tracking-tighter leading-none text-center md:text-left uppercase italic transition-colors line-clamp-2">
              {playlist.name}
            </h1>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 font-black uppercase tracking-tight italic transition-colors">
              Tạo bởi: 
              <span className="text-foreground transition-colors ml-1">
                {playlist.userNickname || 'Người dùng Scriptify'}
              </span>
              <span className="opacity-50 mx-2">•</span>
              <span className="text-primary transition-colors">{playlist.songCount || 0} Bài hát</span>
            </div>

            <button
              onClick={() => playlist.songs?.length > 0 && handlePlayTrack(playlist.songs[0].id)}
              disabled={!playlist.songs?.length}
              className="w-16 h-16 bg-primary rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl hover:bg-primary/90 active:scale-95 group disabled:opacity-50 disabled:hover:scale-100"
            >
              <Play className="w-8 h-8 text-primary-foreground ml-1 fill-current group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 mt-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-[40px_1fr_120px] px-4 py-2 border-b border-border text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-4 italic transition-colors">
            <span>#</span>
            <span>Giai điệu & Nghệ sĩ</span>
            <div className="flex justify-end pr-4 italic">Streams</div>
          </div>

          <div className="space-y-1">
            {playlist.songs && playlist.songs.length > 0 ? (
              playlist.songs.map((track: any, index: number) => (
                <div
                  key={track.id}
                  className="grid grid-cols-[40px_1fr_120px] items-center gap-4 px-4 py-3 rounded-2xl hover:bg-accent transition-colors duration-300 group cursor-pointer border border-transparent hover:border-border"
                  onClick={() => navigate(`/song/${track.id}`)}
                >
                  <div className="flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                    <span className="group-hover:hidden text-[10px] font-black italic">{index + 1}</span>
                    <button onClick={(e) => { e.stopPropagation(); handlePlayTrack(track.id); }}>
                       <Play className="w-4 h-4 hidden group-hover:block fill-current" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col min-w-0 md:flex-row md:items-center md:gap-4">
                    <div className="w-10 h-10 overflow-hidden rounded-md border border-border shrink-0 hidden md:block">
                        <img 
                            src={getResourceUrl(track.imageUrl)} 
                            className="w-full h-full object-cover" 
                            alt={track.title}
                            onError={(e) => e.currentTarget.src = "/assets/default-cover.png"}
                        />
                    </div>
                    
                    <div className="flex flex-col min-w-0">
                        <div className="text-foreground font-black text-sm truncate group-hover:text-primary transition-colors uppercase italic tracking-tight">
                            {track.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate font-black uppercase tracking-widest mt-0.5 transition-colors">
                            {track.artistName || "Nghệ sĩ ẩn danh"}
                        </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 text-muted-foreground font-black text-[10px] pr-4 italic uppercase tracking-widest transition-colors">
                    <span className="tabular-nums opacity-60 mr-2">{(track.viewCount || 0).toLocaleString()}</span>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => e.stopPropagation()} className="p-2 hover:text-primary transition-colors rounded-lg">
                        <Heart size={14} />
                      </button>
                      
                      {isOwner && (
                        <button 
                          onClick={(e) => handleRemoveSong(e, track.id, track.title)} 
                          className="p-2 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50 transition-colors">
                <Music size={48} className="mb-4 opacity-50" />
                <p className="font-black italic text-[10px] uppercase tracking-widest opacity-80 text-center">
                    Playlist này trống rỗng... <br/>Thêm bài hát để khuấy động ngay!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}