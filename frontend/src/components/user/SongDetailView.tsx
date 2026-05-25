import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { Play, Heart, Loader2, Music2, Clock3, Eye, CalendarDays, Share2 } from 'lucide-react';
import { getResourceUrl } from "@/utils/urlHelper";
import { apiRequest } from "@/utils/apiClient";
import { Button } from "@/components/ui/button";

const API_BASE = "/api";

interface MusicContextType {
  handlePlayTrack: (trackId: number) => void;
}

export function SongDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handlePlayTrack } = useOutletContext<MusicContextType>();
  
  const [song, setSong] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH DATA ---
  const fetchSongDetails = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await apiRequest(`${API_BASE}/songs/${id}`);
      if (data) {
        setSong(data);
      }
    } catch (err) {
      console.error("Scriptify: Lỗi tải chi tiết bài hát", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSongDetails();
  }, [fetchSongDetails]);

  // Format thời gian (Giây -> Phút:Giây)
  const formatDuration = (seconds: number) => {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    if (!dateString) return "Không rõ";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // --- UI RENDER ---
  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center bg-background min-h-[70vh] transition-colors duration-300">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  if (!song) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background min-h-[70vh]">
      <Music2 className="w-20 h-20 text-muted-foreground/50 mb-4 animate-pulse" />
      <h2 className="text-2xl font-black italic text-muted-foreground uppercase">Giai điệu không tồn tại</h2>
      <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate(-1)}>Quay lại</Button>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background pb-32 custom-scrollbar transition-colors duration-300">
      
      {/* Phần Header / Hero Section */}
      <div className="relative pt-20 pb-12 px-8 overflow-hidden">
        {/* Ảnh nền làm mờ (Background Blur) */}
        <div 
          className="absolute inset-0 opacity-10 blur-3xl scale-110 saturate-200 transition-all duration-1000"
          style={{ backgroundImage: `url(${getResourceUrl(song.imageUrl)})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row items-end gap-10">
          {/* Bìa bài hát */}
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

          {/* Thông tin chính */}
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

            {/* Cụm Thống kê (Stats) */}
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

      {/*  Action Bar (Thanh công cụ) */}
      <div className="px-8 py-6 flex items-center gap-6 animate-in fade-in duration-1000 delay-300 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-20">
        <Button 
          onClick={() => handlePlayTrack(song.id)}
          className="w-16 h-16 rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(var(--primary),0.3)] flex items-center justify-center p-0"
        >
          <Play className="w-8 h-8 ml-1 fill-current" />
        </Button>
        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full border border-border hover:border-red-500 hover:text-red-500 transition-colors group">
          <Heart className="w-6 h-6 group-hover:fill-current" />
        </Button>
        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full border border-border hover:border-primary hover:text-primary transition-colors">
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Phần Lời tựa / Mô tả (Vừa thêm trong Admin) */}
      {song.description && (
        <div className="px-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 max-w-4xl">
          <h3 className="text-xl font-black italic uppercase tracking-tight text-foreground mb-4">
            <span className="text-primary mr-2">#</span>Lời tựa
          </h3>
          <div className="bg-secondary/20 border border-border rounded-3xl p-8 backdrop-blur-sm">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium text-sm">
              {song.description}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}