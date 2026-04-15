import { Play, Music2, Search, Loader2, AlertCircle } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const API_BASE = "http://localhost:8080/api";

interface MusicContextType {
  handlePlayTrack: (trackId: number) => void;
  allSongs: any[];
}

// Định nghĩa Interface khớp với ArtistProjection ở Backend
interface Artist {
  id: number;
  name: string;
  imageUrl: string;
  totalViews: number;
}

export function ArtistsView() {
  const { handlePlayTrack, allSongs } = useOutletContext<MusicContextType>();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch danh sách nghệ sĩ kèm theo Total Views từ SQL Projection
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setIsLoading(true);
        // Gọi Endpoint mới mà bồ vừa tạo ở ArtistRepository
        const res = await fetch(`${API_BASE}/artists/all-with-views`);
        if (!res.ok) throw new Error("Không thể tải danh sách nghệ sĩ");
        const data = await res.json();
        setArtists(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtists();
  }, []);

  // 2. Lọc nghệ sĩ
  const filteredArtists = useMemo(() => {
    return artists.filter((artist) =>
      artist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [artists, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black min-h-[80vh]">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black p-6 text-center min-h-[80vh]">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-white text-xl mb-2 font-bold">Lỗi kết nối Backend</h3>
        <p className="text-zinc-400 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-green-600 hover:bg-green-500 text-white px-8 py-2 rounded-full transition-all font-bold"
        >
          THỬ LẠI
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32 custom-scrollbar">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-green-900/20 to-transparent pt-16 pb-10 px-8">
        <h2 className="text-5xl font-black text-white mb-3 tracking-tighter">Nghệ sĩ</h2>
        <p className="text-zinc-400 font-medium text-lg">Những gương mặt đang làm chủ bảng xếp hạng Scriptify</p>
        
        <div className="relative mt-10 max-w-lg group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-green-500 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm nghệ sĩ bồ yêu thích..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/40 text-white placeholder-zinc-600 rounded-full py-4 pl-14 pr-6 border border-transparent focus:border-zinc-700 focus:bg-zinc-800/80 transition-all outline-none text-sm font-medium"
          />
        </div>
      </div>

      <div className="px-8 space-y-16">
        {/* Grid Nghệ sĩ Main */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {filteredArtists.map((artist) => {
            // Lấy list bài hát của nghệ sĩ này để nút Play hoạt động
            const artistTracks = allSongs.filter((s: any) => s.artist?.id === artist.id);

            return (
              <div
                key={artist.id}
                className="bg-zinc-900/40 p-5 rounded-2xl hover:bg-zinc-800/60 transition-all group text-center cursor-pointer border border-transparent hover:border-zinc-700/50 shadow-xl"
              >
                <div className="relative mb-5 aspect-square rounded-full overflow-hidden shadow-2xl ring-2 ring-zinc-800/50 group-hover:ring-green-500/50 transition-all duration-500">
                  <img
                    src={artist.imageUrl ? `${API_BASE}${artist.imageUrl}` : "/default-artist.png"}
                    alt={artist.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay & Central Play Button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (artistTracks.length > 0) handlePlayTrack(artistTracks[0].id);
                      }}
                      className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-green-400 active:scale-95 transition-all"
                    >
                      <Play className="w-7 h-7 text-black fill-current ml-1" />
                    </button>
                  </div>
                </div>

                <h4 className="text-white font-bold truncate text-lg tracking-tight">{artist.name}</h4>
                <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-zinc-500 font-black uppercase tracking-widest italic">
                  <span className="flex items-center gap-1.5"><Music2 size={12} className="text-green-500"/> {artistTracks.length} TRACKS</span>
                  <span className="opacity-30">•</span>
                  <span>{artist.totalViews?.toLocaleString() || 0} VIEWS</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nghệ sĩ tiêu biểu (Spotlight) */}
        <div className="space-y-8">
          <h3 className="text-2xl font-black text-white italic tracking-widest uppercase flex items-center gap-4">
            <span className="w-12 h-1 bg-green-500 rounded-full"></span>
            Spotlight
          </h3>
          <div className="grid gap-8">
            {filteredArtists.slice(0, 2).map((artist) => {
              const artistTracks = allSongs.filter((s: any) => s.artist?.id === artist.id);
              if (artistTracks.length === 0) return null;

              return (
                <div key={artist.id} className="bg-gradient-to-r from-zinc-900/60 to-transparent rounded-3xl p-10 border border-zinc-800/30 flex flex-col lg:flex-row gap-10 items-start lg:items-center">
                  <div className="flex items-center gap-8 min-w-[300px]">
                    <img
                      src={artist.imageUrl ? `${API_BASE}${artist.imageUrl}` : "/default-artist.png"}
                      className="w-32 h-32 rounded-full object-cover shadow-2xl ring-4 ring-green-500/20"
                    />
                    <div>
                      <h4 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter leading-none">{artist.name}</h4>
                      <p className="text-green-500 font-bold text-xs uppercase tracking-[0.2em] mb-4">Verified Artist</p>
                      <div className="flex gap-4">
                         <div className="text-center">
                            <p className="text-white font-bold">{artistTracks.length}</p>
                            <p className="text-[9px] text-zinc-500 uppercase">Bài hát</p>
                         </div>
                         <div className="w-[1px] h-8 bg-zinc-800"></div>
                         <div className="text-center">
                            <p className="text-white font-bold">{artist.totalViews?.toLocaleString() || 0}</p>
                            <p className="text-[9px] text-zinc-500 uppercase">Lượt nghe</p>
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 w-full">
                    {artistTracks.slice(0, 4).map((track: any) => (
                      <div
                        key={track.id}
                        onClick={() => handlePlayTrack(track.id)}
                        className="flex items-center gap-4 p-3 bg-zinc-900/40 rounded-xl hover:bg-green-500/10 transition-all cursor-pointer group border border-zinc-800/50 hover:border-green-500/30"
                      >
                        <div className="w-12 h-12 relative flex-shrink-0">
                          <img src={`${API_BASE}${track.imageUrl}`} className="w-full h-full object-cover rounded-lg shadow-lg" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-lg">
                             <Play size={16} className="text-green-500 fill-current" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm truncate group-hover:text-green-500 transition-colors">{track.title}</p>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase">{track.viewCount?.toLocaleString()} lượt nghe</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}