import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, Lock, Play, ChevronLeft, ChevronRight, 
  Mail, Music2, Heart, Plus, Settings, ShieldCheck, Trash2 
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getResourceUrl } from "@/utils/urlHelper";
import { toast } from "sonner";

// Import các Modal
import CreatePlaylistModal from "./CreatePlaylistModal";
import EditProfileModal from "./EditProfileModal";

export default function ProfilePage() {
  const playlistScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const user = useAuthStore((state) => state.user);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch("/api/playlists/me", { credentials: "include" });
      if (res.ok) setPlaylists(await res.json());
    } catch (err) { console.error("Sync playlists failed."); }
  };

  const handleDeletePlaylist = async (e: React.MouseEvent, playlistId: number, playlistName: string) => {
    e.stopPropagation();
    if (!confirm(`Bạn có chắc muốn xóa playlist "${playlistName}" không?`)) return;

    try {
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
        credentials: "include"
      });

      if (res.ok) {
        toast.success(`Đã xóa playlist "${playlistName}"`);
        setPlaylists(prev => prev.filter(pl => pl.id !== playlistId));
      } else {
        toast.error("Không thể xóa playlist này bạn ơi!");
      }
    } catch (err) { toast.error("Lỗi kết nối server rồi!"); }
  };

  useEffect(() => {
    if (!user) return;
    const fetchAllData = async () => {
      await fetchPlaylists();
      try {
        const favRes = await fetch("/api/user/favorites", { credentials: "include" });
        if (favRes.ok) setLikedSongs(await favRes.json());
      } catch (err) { console.error("Sync favorites failed."); }
    };
    fetchAllData();
  }, [user]);

  const checkScroll = () => {
    if (playlistScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = playlistScrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const scrollPlaylists = (direction: 'left' | 'right') => {
    if (playlistScrollRef.current) {
      const scrollAmount = 360; 
      playlistScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Đã gỡ bg-black, thay bằng bg-background, đồng bộ màu kéo bôi đen */}
      <div className="min-h-screen relative overflow-hidden bg-background selection:bg-primary/30 font-sans transition-colors duration-300">
        
        {/* Background Gradients: Đổi màu xanh cứng sang CSS Variable màu của Theme */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-10 blur-[100px] bg-primary"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-[0.05] blur-[120px] bg-primary"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-8 py-16">
          
          {/* 🟢 Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="mb-20 flex flex-col md:flex-row items-center md:items-end gap-10 text-center md:text-left"
          >
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                // Đổi bg-zinc-900 -> bg-secondary, hover viền xanh cứng -> hover:border-primary/50
                className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-2 border-border shadow-2xl relative z-10 bg-secondary transition-all duration-500 group-hover:border-primary/50"
              >
                <img 
                  src={getResourceUrl(user.avatarUrl)} 
                  alt={user.nickname} 
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = '/assets/default-avatar.png')} 
                />
              </motion.div>
              {/* Bóng mờ đằng sau Avatar tự động đổi màu theo Primary */}
              <div className="absolute inset-0 -m-2 bg-primary/15 blur-3xl rounded-full -z-0 opacity-50 transition-opacity group-hover:opacity-80"></div>
            </div>

            <div className="flex-1 pb-2">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center gap-3 justify-center md:justify-start mb-4">
                <span className="bg-primary text-primary-foreground text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                  {user.role}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setIsEditModalOpen(true)} className="p-1.5 rounded-lg bg-secondary/30 border border-border hover:border-primary/50 hover:bg-primary/10 transition-all text-muted-foreground hover:text-foreground"><Settings size={14} /></button>
                  <button onClick={() => setIsPasswordModalOpen(true)} className="p-1.5 rounded-lg bg-secondary/30 border border-border hover:border-primary/50 hover:bg-primary/10 transition-all text-muted-foreground hover:text-foreground"><ShieldCheck size={14} /></button>
                </div>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-black text-foreground leading-[0.8] tracking-tighter mb-6 uppercase italic">
                {user.nickname}
              </h1>
              
              <div className="flex flex-wrap items-center gap-5 text-muted-foreground justify-center md:justify-start font-bold text-[10px] uppercase tracking-widest italic">
                <div className="flex items-center gap-2 border-r border-border pr-5"><Mail size={12} className="text-primary" /> {user.email}</div>
                <div className="flex items-center gap-2 border-r border-border pr-5"><Music2 size={12} className="text-primary" /> {playlists.length} Playlists</div>
                <div className="flex items-center gap-2"><Heart size={12} className="text-primary" /> {likedSongs.length} Favorites</div>
              </div>
            </div>
          </motion.div>

          {/* 🟢 Playlists Section */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8 group/title">
               <div className="flex items-center gap-4">
                  <h2 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] italic group-hover/title:text-primary transition-colors">Playlists</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/30 border border-border hover:border-primary/50 hover:bg-primary/10 transition-all group/btn shadow-sm"
                  >
                    <Plus size={12} className="text-primary group-hover/btn:rotate-90 transition-transform duration-300" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground group-hover/btn:text-foreground">New</span>
                  </motion.button>
               </div>
              <div className="flex gap-2">
                <button onClick={() => scrollPlaylists('left')} disabled={!canScrollLeft} className={`p-2 rounded-full border border-border transition-all ${canScrollLeft ? 'text-primary hover:bg-secondary' : 'text-muted-foreground/30 cursor-not-allowed'}`}><ChevronLeft size={18} /></button>
                <button onClick={() => scrollPlaylists('right')} disabled={!canScrollRight} className={`p-2 rounded-full border border-border transition-all ${canScrollRight ? 'text-primary hover:bg-secondary' : 'text-muted-foreground/30 cursor-not-allowed'}`}><ChevronRight size={18} /></button>
              </div>
            </div>

            <div 
              ref={playlistScrollRef} 
              onScroll={checkScroll} 
              className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar scroll-smooth"
            >
              <AnimatePresence mode="popLayout">
                {playlists.length > 0 ? playlists.map((pl) => (
                  <motion.div 
                    key={pl.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ y: -5 }} 
                    className="w-[180px] min-w-[180px] shrink-0 group cursor-pointer relative"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden mb-3 bg-secondary border border-border relative shadow-lg group-hover:border-primary/30 transition-all">
                      <img src={getResourceUrl(pl.thumbnailUrl)} className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 transition-all duration-700" alt={pl.name} />
                      <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                          <Play fill="currentColor" size={16} className="ml-1 text-primary-foreground" />
                        </div>
                        <button onClick={(e) => handleDeletePlaylist(e, pl.id, pl.name)} className="w-8 h-8 bg-destructive/20 backdrop-blur-md border border-destructive/50 rounded-full flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all shadow-md">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-xl bg-background/60 border border-border">
                        {pl.isPublic ? <Globe size={12} className="text-primary" /> : <Lock size={12} className="text-muted-foreground" />}
                      </div>
                    </div>
                    <h3 className="text-foreground text-[11px] font-bold uppercase italic tracking-wider truncate group-hover:text-primary transition-colors px-1">{pl.name}</h3>
                  </motion.div>
                )) : (
                  <div className="w-full h-32 flex items-center justify-center border border-dashed border-border rounded-2xl text-muted-foreground/50 font-black uppercase italic tracking-widest text-[9px]">
                    Vault is empty
                  </div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* 🟢 Heart Beats Section */}
          <section>
            <div className="flex items-center gap-4 mb-8 group/title">
               <h2 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] italic group-hover/title:text-primary transition-colors">Heart Beats</h2>
               <div className="h-[1px] w-16 bg-border group-hover/title:bg-primary/20 transition-colors"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {likedSongs.slice(0, 6).map((song, i) => (
                <motion.div key={song.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }} className="flex items-center gap-4 p-2.5 rounded-xl bg-secondary/20 hover:bg-accent border border-border transition-all group shadow-sm">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary border border-border shrink-0">
                    <img src={getResourceUrl(song.imageUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-foreground font-bold truncate text-[13px] uppercase italic tracking-tight">{song.title}</h4>
                    <p className="text-primary text-[9px] font-black uppercase tracking-widest truncate mt-0.5 opacity-70">{song.artist?.name}</p>
                  </div>
                  <Heart size={12} className="text-primary fill-primary mr-3" />
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>

      <CreatePlaylistModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={fetchPlaylists} />
      <EditProfileModal isOpen={isEditModalOpen} mode="info" onClose={() => setIsEditModalOpen(false)} />
      <EditProfileModal isOpen={isPasswordModalOpen} mode="password" onClose={() => setIsPasswordModalOpen(false)} />
    </>
  );
}