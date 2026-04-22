import { Play, Music2, Search, Loader2, AlertCircle, Eye } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getResourceUrl } from '@/utils/urlHelper'; // Import helper bồ đã tạo

const API_BASE = "http://localhost:8080/api";

interface MusicContextType {
  handlePlayTrack: (trackId: number) => void;
  allSongs: any[];
}

interface Artist {
  id: number;
  name: string;
  bio: string;
  imageUrl: string;
  totalViews: number;
  songCount: number;
  topSongs: {
    id: number;
    title: string;
    viewCount: number;
    imageUrl: string;
  }[];
}

export function ArtistsView() {
  const { handlePlayTrack } = useOutletContext<MusicContextType>();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setIsLoading(true);
        // Endpoint trả về List<ArtistResponse> đã fetch join songs
        const res = await fetch(`${API_BASE}/artists/all-with-views`);
        if (!res.ok) throw new Error("Không thể kết nối đến máy chủ Cloud");
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

  const filteredArtists = useMemo(() => {
    return artists.filter((artist) =>
      artist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [artists, searchQuery]);

  const spotlightArtists = useMemo(() => {
    return [...filteredArtists]
      .sort((a, b) => (b.totalViews || 0) - (a.totalViews || 0))
      .slice(0, 2);
  }, [filteredArtists]);

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center bg-black min-h-[80vh]">
      <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-black p-6 min-h-[80vh]">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-white text-xl font-bold uppercase italic">Lỗi Hệ Thống Cloud</h3>
      <p className="text-zinc-400 mb-6 font-medium">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-green-600 hover:bg-green-500 text-black px-10 py-3 rounded-full font-black transition-all shadow-lg hover:scale-105 active:scale-95"
      >
        THỬ LẠI NGAY
      </button>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32 custom-scrollbar">
      {/* Search Header */}
      <div className="bg-gradient-to-b from-green-900/20 to-transparent pt-16 pb-10 px-8">
        <h2 className="text-6xl font-black text-white mb-3 tracking-tighter italic uppercase">Nghệ sĩ</h2>
        <p className="text-zinc-400 font-bold text-lg italic">Những gương mặt đang làm chủ bảng xếp hạng Scriptify Cloud</p>
        
        <div className="relative mt-10 max-w-lg group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-green-500 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm nghệ sĩ bồ yêu thích..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/40 text-white rounded-full py-4 pl-14 pr-6 focus:bg-zinc-800/80 outline-none text-sm border border-transparent focus:border-zinc-700 transition-all placeholder:italic"
          />
        </div>
      </div>

      <div className="px-8 space-y-16">
        {/* Grid Nghệ sĩ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {filteredArtists.map((artist) => (
            <div key={artist.id} className="bg-zinc-900/40 p-5 rounded-3xl hover:bg-zinc-800/60 transition-all group text-center cursor-pointer border border-zinc-800/30 hover:border-green-500/20 shadow-2xl">
              <div className="relative mb-6 aspect-square rounded-full overflow-hidden ring-4 ring-zinc-800/50 group-hover:ring-green-500/50 transition-all shadow-inner">
                {/* Dùng getResourceUrl cho ảnh nghệ sĩ */}
                <img 
                  src={getResourceUrl(artist.imageUrl)} 
                  alt={artist.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  onError={(e) => (e.currentTarget.src = "/assets/default-artist.png")}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40 backdrop-blur-[2px]">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (artist.topSongs?.length > 0) handlePlayTrack(artist.topSongs[0].id);
                    }}
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl shadow-green-500/40"
                  >
                    <Play className="w-8 h-8 text-black fill-current ml-1" />
                  </button>
                </div>
              </div>
              <h4 className="text-white font-black truncate text-xl tracking-tighter uppercase italic">{artist.name}</h4>
              <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-zinc-500 font-black uppercase italic tracking-widest bg-black/20 py-2 rounded-full">
                <span className="flex items-center gap-1.5"><Music2 size={12} className="text-green-500"/> {artist.songCount ?? 0}</span>
                <span className="opacity-30">|</span>
                <span className="flex items-center gap-1.5"><Eye size={12} className="text-blue-400"/> {(artist.totalViews ?? 0).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Spotlight Section */}
        <div className="space-y-10">
          <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase flex items-center gap-6">
            <span className="w-16 h-1.5 bg-green-500 rounded-full"></span> Tiêu điểm Spotlight
          </h3>
          <div className="grid gap-10">
            {spotlightArtists.map((artist) => (
              <div key={artist.id} className="bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-transparent rounded-[2.5rem] p-12 border border-zinc-800/40 flex flex-col lg:flex-row gap-12 items-start lg:items-center shadow-3xl">
                <div className="flex items-center gap-10 min-w-[350px]">
                  <img 
                    src={getResourceUrl(artist.imageUrl)} 
                    className="w-40 h-40 rounded-full object-cover shadow-2xl ring-8 ring-green-500/10" 
                    onError={(e) => (e.currentTarget.src = "/assets/default-artist.png")}
                  />
                  <div>
                    <h4 className="text-5xl font-black text-white mb-2 uppercase italic tracking-tighter leading-none">{artist.name}</h4>
                    <p className="text-zinc-400 text-sm italic mb-6 line-clamp-2 max-w-md font-medium leading-relaxed">
                      {artist.bio || "Một trong những nghệ sĩ tài năng nhất đang khuấy đảo cộng đồng Scriptify."}
                    </p>
                    <div className="flex gap-6 bg-black/30 w-fit px-6 py-3 rounded-2xl border border-zinc-800/50">
                       <div className="text-center">
                          <p className="text-green-500 text-xl font-black italic leading-none">{artist.songCount ?? 0}</p>
                          <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Tracks</p>
                       </div>
                       <div className="w-[1px] h-8 bg-zinc-800 mt-1"></div>
                       <div className="text-center">
                          <p className="text-blue-400 text-xl font-black italic leading-none">{(artist.totalViews ?? 0).toLocaleString()}</p>
                          <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Streams</p>
                       </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
                  {artist.topSongs?.length > 0 ? (
                    artist.topSongs.slice(0, 4).map((track) => (
                      <div 
                        key={track.id} 
                        onClick={() => handlePlayTrack(track.id)} 
                        className="flex items-center gap-5 p-4 bg-zinc-900/60 rounded-2xl hover:bg-green-500/10 transition-all cursor-pointer group border border-zinc-800/50 hover:border-green-500/30 shadow-lg"
                      >
                        <div className="w-14 h-14 relative flex-shrink-0">
                          {/* Dùng getResourceUrl cho ảnh bài hát của Artist */}
                          <img 
                            src={getResourceUrl(track.imageUrl)} 
                            className="w-full h-full object-cover rounded-xl shadow-xl" 
                            onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")}
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-xl">
                             <Play size={20} className="text-green-500 fill-current" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-black text-base truncate group-hover:text-green-500 transition-colors uppercase italic tracking-tight">{track.title}</p>
                          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-0.5">{track.viewCount?.toLocaleString()} Lượt nghe</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-10 text-center bg-black/20 rounded-3xl border border-dashed border-zinc-800">
                      <p className="text-zinc-600 italic font-bold uppercase tracking-widest text-xs">Hiện chưa có bài hát tiêu điểm</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}