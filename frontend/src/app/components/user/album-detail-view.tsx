import { ArrowLeft, Play, Heart, Loader2, Music } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';

const API_BASE = "http://localhost:8080/api";

interface MusicContextType {
  handlePlayTrack: (trackId: number) => void;
  allSongs: any[]; // Danh sách toàn bộ bài hát để lọc theo album
}

export function AlbumDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handlePlayTrack, allSongs } = useOutletContext<MusicContextType>();

  const [album, setAlbum] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Lấy thông tin chi tiết Album từ Backend
  useEffect(() => {
    const fetchAlbumDetail = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/albums/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAlbum(data);
        }
      } catch (err) {
        console.error("Lỗi fetch album:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlbumDetail();
  }, [id]);

  // 2. Lọc danh sách bài hát thuộc album này từ allSongs
  const tracks = useMemo(() => {
    if (!allSongs) return [];
    return allSongs.filter(track => track.album?.id === Number(id));
  }, [allSongs, id]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black min-h-screen">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black gap-4">
        <p className="text-zinc-400 text-xl font-bold uppercase tracking-widest">Album không tồn tại!</p>
        <button onClick={() => navigate('/albums')} className="text-purple-500 hover:text-purple-400 font-bold transition">
          ← QUAY LẠI DANH SÁCH
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32 custom-scrollbar">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-purple-900/40 to-transparent px-8 pt-8 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6 group bg-black/20 w-fit px-4 py-1.5 rounded-full border border-white/5"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase">Quay lại</span>
        </button>

        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 max-w-6xl mx-auto">
          <div className="w-64 h-64 flex-shrink-0 shadow-[0_20px_60px_rgba(0,0,0,0.7)] rounded-xl overflow-hidden group">
            <img
              src={album.coverImageUrl ? `${API_BASE}${album.coverImageUrl}` : "/default-album.png"}
              alt={album.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => (e.currentTarget.src = "/default-album.png")}
            />
          </div>
          
          <div className="flex flex-col items-center md:items-start flex-1">
            <p className="text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-[0.3em]">Album</p>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter leading-none text-center md:text-left uppercase italic">
              {album.title}
            </h1>
            
            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6 font-bold uppercase tracking-tight">
              <span className="text-white hover:underline cursor-pointer decoration-purple-500 underline-offset-4">
                {album.artist?.name || 'Nghệ sĩ ẩn danh'}
              </span>
              <span className="text-zinc-600">•</span>
              <span>{album.releaseYear || '2026'}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-purple-400">{tracks.length} bài hát</span>
            </div>

            <button
              onClick={() => tracks.length > 0 && handlePlayTrack(tracks[0].id)}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-2xl hover:bg-green-400 active:scale-95 group"
            >
              <Play className="w-8 h-8 text-black ml-1 fill-current group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Tracks List Container */}
      <div className="px-8 mt-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-[40px_1fr_120px] px-4 py-2 border-b border-zinc-800/50 text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">
            <span>#</span>
            <span>Tiêu đề & Nghệ sĩ</span>
            <div className="flex justify-end pr-4">Lượt nghe</div>
          </div>

          <div className="space-y-1">
            {tracks.length > 0 ? (
              tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="grid grid-cols-[40px_1fr_120px] items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5"
                  onClick={() => handlePlayTrack(track.id)}
                >
                  <div className="flex items-center justify-center text-zinc-500">
                    <span className="group-hover:hidden text-sm font-bold">{index + 1}</span>
                    <Play className="w-4 h-4 hidden group-hover:block text-green-500 fill-current" />
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <div className="text-zinc-200 font-bold text-sm truncate group-hover:text-white transition-colors uppercase italic tracking-tight">
                        {track.title}
                    </div>
                    <div className="text-xs text-zinc-500 truncate group-hover:text-zinc-400 transition-colors">
                        {track.artist?.name}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 text-zinc-500 font-bold text-xs pr-4">
                    <span className="tabular-nums opacity-60">{(track.viewCount || 0).toLocaleString()}</span>
                    <Heart size={14} className="hover:text-red-500 transition-colors cursor-pointer" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-700">
                <Music size={48} className="mb-4 opacity-10" />
                <p className="font-bold italic">Album này hiện chưa có bài hát nào bồ ơi!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}