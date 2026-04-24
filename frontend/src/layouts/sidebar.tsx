import { NavLink, Link, useNavigate } from "react-router-dom";
import { Home, Library, Heart, User, Music2, LogOut, Mic2, ShieldCheck } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from "@/store/useAuthStore";
import { getResourceUrl } from "@/utils/urlHelper";
import { toast } from "sonner";

const API_BASE = "/api";

export function Sidebar({ onPlayTrack }: { onPlayTrack: (id: number) => void }) {
  const navigate = useNavigate();
  
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  
  const [favouriteTracks, setFavouriteTracks] = useState<any[]>([]);
  const isFirstRender = useRef(true); 

  const restoreUserSession = useCallback(async () => {
    if (user) return; 
    try {
      const response = await fetch(`${API_BASE}/user/me`, {
        method: "GET",
        credentials: "include" 
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (err) {
      console.error("Scriptify Cloud: Restore session failed.");
    }
  }, [setUser, user]);

  const fetchFavs = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/favorites`, {
        method: "GET",
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setFavouriteTracks(data); 
      }
    } catch (err) {
      console.error("Scriptify Cloud: Sync Library failed.");
    }
  }, [user]);

  useEffect(() => {
    if (isFirstRender.current) {
      restoreUserSession();
      isFirstRender.current = false;
    }
  }, [restoreUserSession]);

  useEffect(() => {
    if (user) {
      fetchFavs();
      window.addEventListener('favoriteUpdate', fetchFavs);
    } else {
      setFavouriteTracks([]);
    }
    return () => window.removeEventListener('favoriteUpdate', fetchFavs);
  }, [user, fetchFavs]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { 
        method: "POST", 
        credentials: "include" 
      });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      logout(); 
      toast.success("Hẹn gặp lại nhé!", { icon: "👋" });
      navigate("/login");
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-4 w-full transition-all duration-300 px-4 py-3 rounded-xl group ${
      isActive 
        ? 'text-green-500 font-black bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.15)] border border-green-500/20' 
        : 'text-zinc-500 hover:text-green-400 hover:bg-green-500/5'
    }`;

  return (
    <div className="w-64 bg-black border-r border-white/5 flex flex-col h-full font-sans select-none relative z-50 shadow-2xl">
      <div className="p-6 mb-2">
        {!user ? (
          <Link to="/login" className="flex items-center gap-4 text-zinc-400 hover:text-white transition-all group bg-zinc-900/10 p-4 rounded-2xl border border-white/5 active:scale-95 animate-in fade-in duration-500 hover:border-green-500/20 hover:bg-green-500/5">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center group-hover:bg-green-500 group-hover:text-black transition-all">
              <User className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Đăng nhập</span>
          </Link>
        ) : (
          <div className="flex items-center gap-4 p-2 animate-in slide-in-from-left-2 duration-500 bg-green-500/5 rounded-2xl border border-green-500/10 shadow-inner">
            <div className="relative shrink-0 group">
              <img 
                src={getResourceUrl(user.avatarUrl)} 
                className="w-12 h-12 rounded-full object-cover border-2 border-zinc-800 group-hover:border-green-500 transition-all duration-500 shadow-xl" 
                alt="Avatar"
                onError={(e) => (e.currentTarget.src = '/assets/default-avatar.png')}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black truncate text-sm uppercase tracking-tighter italic leading-none mb-1.5">
                {user.nickname || user.username}
              </p>
              <button onClick={handleLogout} className="text-[9px] text-zinc-600 hover:text-red-500 flex items-center gap-1 transition-colors uppercase font-black tracking-widest italic">
                <LogOut className="w-2.5 h-2.5" /> Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
        <nav className="space-y-1.5">
          <NavLink to="/" className={navLinkClass}>
            <Home className="w-5 h-5" />
            <span className="text-[12px] font-black uppercase tracking-widest italic">Trang chủ</span>
          </NavLink>
          <NavLink to="/artists" className={navLinkClass}>
            <Mic2 className="w-5 h-5" />
            <span className="text-[12px] font-black uppercase tracking-widest italic">Nghệ sĩ</span>
          </NavLink>
          <NavLink to="/albums" className={navLinkClass}>
            <Library className="w-5 h-5" />
            <span className="text-[12px] font-black uppercase tracking-widest italic">Albums</span>
          </NavLink>
          {user && (
            <NavLink to="/favorites" className={navLinkClass}>
              <Heart className="w-5 h-5 group-hover:fill-green-500 group-active:fill-green-500 transition-colors" />
              <span className="text-[12px] font-black uppercase tracking-widest italic">Yêu thích</span>
            </NavLink>
          )}
        </nav>

        {user && (
          <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex items-center justify-between px-4 mb-5 group/lib">
              <h3 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] italic group-hover/lib:text-green-500 transition-colors">Cloud Vault</h3>
              <div className="h-[1px] flex-1 bg-white/5 ml-4 group-hover/lib:bg-green-500/20 transition-colors"></div>
            </div>
            
            {favouriteTracks.length > 0 ? (
              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar-hidden">
                {favouriteTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => onPlayTrack(track.id)}
                    className="flex items-center gap-3 text-zinc-500 transition-all w-full p-2.5 px-4 rounded-xl text-left group hover:bg-green-500/10 active:scale-95 border border-transparent hover:border-green-500/20 hover:shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-green-500/30 transition-all shadow-md group-hover:bg-green-500/10">
                      <Music2 className="w-3.5 h-3.5 text-zinc-800 group-hover:text-green-500 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-tighter truncate leading-none mb-1 group-hover:italic transition-all group-hover:text-white">
                        {track.title}
                      </p>
                      <p className="text-[9px] text-zinc-700 truncate font-black uppercase tracking-widest italic group-hover:text-green-600">
                        {track.artist?.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 rounded-[2rem] bg-zinc-900/10 border border-dashed border-white/5 text-center group hover:border-green-500/20 hover:bg-green-500/5 transition-all">
                 <Heart className="w-5 h-5 mx-auto mb-3 text-zinc-800 group-hover:text-green-500/40 transition-colors"/>
                 <p className="text-[9px] text-zinc-800 font-black uppercase tracking-[0.2em] leading-relaxed italic group-hover:text-green-800 transition-colors">
                    Giai điệu trống... <br/>Thả tim để lưu Cloud
                 </p>
              </div>
            )}
          </div>
        )}
      </div>

      {user?.role === "ADMIN" && (
        <div className="p-4 mt-auto border-t border-white/5 bg-gradient-to-t from-green-500/10 to-transparent">
          <NavLink to="/admin" className={navLinkClass}>
            <ShieldCheck className="w-5 h-5 stroke-[2.5px]" /> 
            <span className="text-[12px] font-black uppercase tracking-widest italic">Control Panel</span>
          </NavLink>
        </div>
      )}
    </div>
  );
}