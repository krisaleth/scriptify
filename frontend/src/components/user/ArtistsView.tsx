import { Play, Music2, Search, Loader2, AlertCircle, Eye, TrendingUp, Users } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getResourceUrl } from '@/utils/urlHelper';

const API_BASE = "/api";

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

  const fetchArtists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/artists/all-with-views`, {
        method: "GET",
        credentials: "include", 
      });
      if (!res.ok) throw new Error("Cloud sync failed");
      const data = await res.json();
      setArtists(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchArtists(); }, [fetchArtists]);

  const filteredArtists = useMemo(() => {
    return artists.filter((artist) =>
      artist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [artists, searchQuery]);

  const spotlightArtists = useMemo(() => {
    return [...artists]
      .sort((a, b) => (b.totalViews || 0) - (a.totalViews || 0))
      .slice(0, 2);
  }, [artists]);

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center bg-black min-h-screen">
      <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
    </div>
  );

  return (
    // ✅ FIX: padding-bottom (pb-20) vừa đủ để không bị che bởi Music Player mà không dư thừa
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-black pb-20 custom-scrollbar select-none">
      
      {/* Header & Search */}
      <div className="relative px-6 md:px-10 pt-16 pb-8 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter italic uppercase leading-none">Nghệ sĩ</h2>
          <p className="text-zinc-500 font-black text-[10px] italic uppercase tracking-[0.4em] opacity-40">Scriptify Cloud Engine</p>
          
          <div className="relative mt-8 max-w-xl group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-green-500 transition-all" />
            <input
              type="text"
              placeholder="Tìm nghệ sĩ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/40 text-white rounded-2xl py-4 pl-16 pr-8 outline-none border border-white/5 focus:border-green-500/20 transition-all font-bold italic shadow-2xl"
            />
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 space-y-16">
        
        {/* 🟢 1. SPOTLIGHT */}
        {!searchQuery && spotlightArtists.length > 0 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex items-center gap-4">
              <TrendingUp className="text-green-500" size={20} />
              <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Spotlight</h3>
            </div>

            <div className="grid gap-8">
              {spotlightArtists.map((artist, idx) => (
                <div key={artist.id} className="group relative bg-zinc-900/20 rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-green-500/20 transition-all duration-500">
                  <div className="relative z-10 flex flex-col xl:flex-row gap-10 p-8 xl:p-10 items-center">
                    <div className="relative shrink-0">
                       <img 
                          src={getResourceUrl(artist.imageUrl)} 
                          className="w-40 h-40 md:w-52 md:h-52 rounded-full object-cover shadow-2xl ring-8 ring-black group-hover:ring-green-500/10 transition-all duration-700" 
                          onError={(e) => (e.currentTarget.src = "/assets/default-artist.png")}
                       />
                       <div className="absolute -bottom-1 -right-1 bg-green-500 text-black font-black px-4 py-1 rounded-full text-[9px] italic shadow-2xl uppercase">TOP {idx + 1}</div>
                    </div>
                    
                    <div className="flex-1 text-center xl:text-left min-w-0">
                        {/* ✅ FIX 1: Dùng whitespace-nowrap hoặc font-size responsive để không rớt 1 chữ cái */}
                        <h4 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase italic tracking-tighter leading-[0.9] mb-4 overflow-hidden text-ellipsis whitespace-nowrap xl:whitespace-normal">
                          {artist.name}
                        </h4>
                        <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest leading-relaxed mb-6 opacity-70">
                           {artist.bio || "Scriptify Spotlight Artist"}
                        </p>
                        
                        <div className="flex items-center justify-center xl:justify-start gap-4">
                           <div className="bg-black/40 px-6 py-2.5 rounded-2xl border border-white/5">
                              <span className="block text-green-500 text-xl font-black italic leading-none">{(artist.totalViews ?? 0).toLocaleString()}</span>
                              <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mt-1 block">GLOBAL VIEWS</span>
                           </div>
                           <button onClick={() => artist.topSongs?.[0] && handlePlayTrack(artist.topSongs[0].id)} className="bg-green-500 hover:bg-green-400 w-12 h-12 rounded-2xl text-black shadow-2xl flex items-center justify-center transition-transform active:scale-90">
                             <Play size={24} fill="currentColor" className="ml-1" />
                           </button>
                        </div>
                    </div>

                    <div className="w-full xl:w-[350px] grid gap-3 shrink-0">
                      {artist.topSongs?.slice(0, 2).map((track) => (
                        <div key={track.id} onClick={() => handlePlayTrack(track.id)} className="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-white/5 hover:border-green-500/10 transition-all cursor-pointer group/item">
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative shadow-md">
                            <img src={getResourceUrl(track.imageUrl)} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-black text-xs truncate uppercase italic tracking-tighter group-hover/item:text-green-400 transition-colors">{track.title}</p>
                            <p className="text-[8px] text-zinc-600 font-bold uppercase mt-1 flex items-center gap-2"><Eye size={10}/> {track.viewCount?.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎨 2. ALL ARTISTS GRID */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
               <Users size={20} className="text-green-500" />
               <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Danh sách nghệ sĩ</h3>
            </div>
          </div>
          
          {/* ✅ FIX 2: Loại bỏ khoảng trắng ở cuối bằng cách dùng h-fit và tối ưu gap */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6 w-full h-fit">
            {filteredArtists.map((artist) => (
              <div 
                key={artist.id} 
                className="group bg-zinc-900/30 p-6 rounded-[2rem] border border-white/5 hover:border-green-500/20 hover:bg-zinc-800/40 transition-all duration-500 text-center cursor-pointer shadow-xl relative overflow-hidden"
              >
                <div className="relative mx-auto mb-6 aspect-square w-full max-w-[150px] rounded-full overflow-hidden ring-8 ring-zinc-950 group-hover:ring-green-500/20 transition-all duration-700 shadow-2xl">
                  <img 
                    src={getResourceUrl(artist.imageUrl)} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    onError={(e) => (e.currentTarget.src = "/assets/default-artist.png")}
                  />
                  <div className="absolute inset-0 bg-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <button onClick={(e) => { e.stopPropagation(); artist.topSongs?.[0] && handlePlayTrack(artist.topSongs[0].id); }} className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black shadow-2xl hover:scale-110 transition-transform">
                      <Play size={24} fill="currentColor" className="ml-1" />
                    </button>
                  </div>
                </div>

                <h4 className="text-white font-black text-lg uppercase italic tracking-tighter group-hover:text-green-500 transition-colors leading-tight mb-4 min-h-[2.5rem] flex items-center justify-center">
                  {artist.name}
                </h4>

                <div className="flex items-center justify-center gap-4 text-[8px] text-zinc-500 font-black uppercase tracking-widest italic bg-black/40 py-2.5 rounded-2xl border border-white/5 group-hover:border-green-500/10 transition-all">
                  <span className="flex items-center gap-1.5"><Music2 size={10} className="text-green-500"/> {artist.songCount ?? 0}</span>
                  <div className="w-[1px] h-3 bg-zinc-800"></div>
                  <span className="flex items-center gap-1.5"><Eye size={10} className="text-blue-400"/> {(artist.totalViews ?? 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}