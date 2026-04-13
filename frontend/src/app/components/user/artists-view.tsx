import { Play, Music2, Search, Loader2, AlertCircle } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const BASE_URL = "http://localhost:8080";
const API_BASE = "http://localhost:8080/api";

interface MusicContextType {
  handlePlayTrack: (trackId: number) => void;
  allSongs: any[]; // Danh sách bài hát lấy từ cha (MusicApp)
}

export function ArtistsView() {
  const { handlePlayTrack, allSongs } = useOutletContext<MusicContextType>();

  const [artists, setArtists] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch danh sách nghệ sĩ từ Backend
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/artists/all`);
        if (!res.ok) throw new Error("Không thể tải danh sách nghệ sĩ");
        const data = await res.json();
        setArtists(Array.isArray(data) ? data : data.content || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtists();
  }, []);

  // 2. Lọc nghệ sĩ theo tìm kiếm
  const filteredArtists = useMemo(() => {
    return artists.filter((artist) =>
      artist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [artists, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black min-h-screen">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black p-6 text-center">
        <div className="max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-white text-xl mb-2 font-bold">Lỗi rồi bồ ơi!</h3>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-green-600 text-white px-8 py-2 rounded-full">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32 custom-scrollbar">
      {/* Header */}
      <div className="bg-gradient-to-b from-green-900/20 to-transparent pt-12 pb-8 px-8">
        <h2 className="text-4xl font-bold text-white mb-2">Nghệ sĩ</h2>
        <p className="text-zinc-400 font-medium">Khám phá những gương mặt âm nhạc từ hệ thống</p>
        
        <div className="relative mt-8 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm tên nghệ sĩ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/50 text-white placeholder-zinc-500 rounded-full py-3 pl-12 pr-6 focus:ring-2 focus:ring-green-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="px-8">
        {/* Grid Nghệ sĩ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {filteredArtists.map((artist) => {
            // Tính số bài hát của nghệ sĩ này từ danh sách allSongs của cha truyền xuống
            const artistTracks = allSongs.filter((s: any) => s.artist?.id === artist.id);
            const totalViews = artistTracks.reduce((sum, s) => sum + (s.viewCount || 0), 0);

            return (
              <div
                key={artist.id}
                className="bg-zinc-900/40 p-5 rounded-2xl hover:bg-zinc-800/60 transition-all group text-center cursor-pointer border border-transparent hover:border-zinc-700"
              >
                <div className="relative mb-4 aspect-square rounded-full overflow-hidden shadow-2xl ring-1 ring-zinc-800 group-hover:ring-green-500/50 transition-all">
                  <img
                    src={artist.imageUrl ? `${API_BASE}${artist.imageUrl}` : "/default-artist.png"}
                    alt={artist.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (artistTracks.length > 0) handlePlayTrack(artistTracks[0].id);
                    }}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl hover:bg-green-400"
                  >
                    <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                  </button>
                </div>
                <h4 className="text-white font-bold truncate">{artist.name}</h4>
                <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
                  <span className="flex items-center gap-1"><Music2 size={12}/> {artistTracks.length} bài</span>
                  <span>•</span>
                  <span>{totalViews.toLocaleString()} lượt nghe</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nghệ sĩ tiêu biểu (Detail View) */}
        <div className="mt-20 space-y-12">
          <h3 className="text-2xl font-black text-white italic tracking-widest uppercase">Gương mặt tiêu biểu</h3>
          <div className="grid gap-10">
            {filteredArtists.slice(0, 2).map((artist) => {
              const artistTracks = allSongs.filter((s: any) => s.artist?.id === artist.id);
              if (artistTracks.length === 0) return null;

              return (
                <div key={artist.id} className="bg-zinc-900/30 rounded-3xl p-8 border border-zinc-800/50">
                  <div className="flex items-center gap-6 mb-8">
                    <img
                      src={artist.imageUrl ? `${API_BASE}${artist.imageUrl}` : "/default-artist.png"}
                      className="w-24 h-24 rounded-full object-cover shadow-2xl ring-4 ring-zinc-800"
                    />
                    <div>
                      <h4 className="text-4xl font-black text-white mb-1 uppercase italic tracking-tighter">{artist.name}</h4>
                      <p className="text-zinc-500 font-medium">Đang có {artistTracks.length} tác phẩm trên Scriptify</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {artistTracks.slice(0, 4).map((track: any) => (
                      <div
                        key={track.id}
                        onClick={() => handlePlayTrack(track.id)}
                        className="flex items-center gap-4 p-3 bg-black/40 rounded-xl hover:bg-zinc-800/80 transition-all cursor-pointer group border border-zinc-800/50"
                      >
                        <div className="w-12 h-12 relative flex-shrink-0">
                          <img src={`${API_BASE}${track.imageUrl}`} className="w-full h-full object-cover rounded-md shadow-lg" />
                          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 opacity-0 group-hover:opacity-100 transition rounded-md">
                            <Play size={16} className="text-green-500 fill-current" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm truncate">{track.title}</p>
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