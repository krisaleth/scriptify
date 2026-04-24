import { ArrowLeft, Play, Heart, Loader2, Music } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { getResourceUrl } from '@/utils/urlHelper';

// ĐỔI SANG ĐƯỜNG DẪN TƯƠNG ĐỐI: Để đi qua Vite Proxy/Nginx
const API_BASE = "/api";

interface MusicContextType {
  handlePlayTrack: (trackId: number) => void;
  allSongs: any[];
}

export function AlbumDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handlePlayTrack, allSongs } = useOutletContext<MusicContextType>();

  const [album, setAlbum] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch chi tiết Album qua Proxy
  useEffect(() => {
    const fetchAlbumDetail = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/albums/${id}`, {
          credentials: "include" // Gửi kèm Cookie để BE nhận diện
        });
        if (res.ok) {
          const data = await res.json();
          setAlbum(data);
        }
      } catch (err) {
        console.error("Scriptify: Lỗi fetch album qua Proxy:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlbumDetail();
  }, [id]);

  // 2. Lọc danh sách bài hát thuộc album
  const tracks = useMemo(() => {
    if (!allSongs) return [];
    return allSongs.filter(track => track.album?.id === Number(id));
  }, [allSongs, id]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black min-h-screen">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black gap-4 p-8 text-center">
        <p className="text-zinc-400 text-xl font-bold uppercase tracking-widest italic">Album này không tồn tại trong Cloud!</p>
        <button onClick={() => navigate('/albums')} className="text-green-500 hover:text-green-400 font-black transition-all uppercase underline decoration-green-500/30 underline-offset-8">
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32 custom-scrollbar">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-green-900/20 to-transparent px-8 pt-8 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6 group bg-black/20 w-fit px-4 py-1.5 rounded-full border border-white/5"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase italic">Quay lại</span>
        </button>

        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 max-w-6xl mx-auto">
          <div className="w-64 h-64 flex-shrink-0 shadow-[0_20px_60px_rgba(0,0,0,0.7)] rounded-3xl overflow-hidden group border border-white/5">
            <img
              src={getResourceUrl(album.coverImageUrl)}
              alt={album.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")}
            />
          </div>
          
          <div className="flex flex-col items-center md:items-start flex-1">
            <p className="text-[10px] font-black text-green-500 mb-2 uppercase tracking-[0.4em] italic">Cloud Album</p>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter leading-none text-center md:text-left uppercase italic">
              {album.title}
            </h1>
            
            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6 font-black uppercase tracking-tight italic">
              <span className="text-white hover:text-green-400 cursor-pointer transition-colors">
                {album.artist?.name || 'Nghệ sĩ ẩn danh'}
              </span>
              <span className="text-zinc-800">•</span>
              <span>{album.releaseYear || '2026'}</span>
              <span className="text-zinc-800">•</span>
              <span className="text-green-500">{tracks.length} Tracks</span>
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

      {/* Tracks List */}
      <div className="px-8 mt-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-[40px_1fr_120px] px-4 py-2 border-b border-zinc-800/50 text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-4 italic">
            <span>#</span>
            <span>Giai điệu & Nghệ sĩ</span>
            <div className="flex justify-end pr-4 italic">Streams</div>
          </div>

          <div className="space-y-1">
            {tracks.length > 0 ? (
              tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="grid grid-cols-[40px_1fr_120px] items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-white/5"
                  onClick={() => handlePlayTrack(track.id)}
                >
                  <div className="flex items-center justify-center text-zinc-600 group-hover:text-green-500">
                    <span className="group-hover:hidden text-[10px] font-black italic">{index + 1}</span>
                    <Play className="w-4 h-4 hidden group-hover:block fill-current" />
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <div className="text-zinc-200 font-black text-sm truncate group-hover:text-green-400 transition-colors uppercase italic tracking-tight">
                        {track.title}
                    </div>
                    <div className="text-[10px] text-zinc-600 truncate font-black uppercase tracking-widest mt-0.5">
                        {track.artist?.name}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 text-zinc-500 font-black text-[10px] pr-4 italic uppercase tracking-widest">
                    <span className="tabular-nums opacity-60">{(track.viewCount || 0).toLocaleString()}</span>
                    <Heart size={14} className="hover:text-red-500 transition-colors cursor-pointer" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-800">
                <Music size={48} className="mb-4 opacity-5" />
                <p className="font-black italic text-[10px] uppercase tracking-widest opacity-20 text-center">
                    Giai điệu đang được tuồn vào Cloud... <br/>Vui lòng quay lại sau!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}