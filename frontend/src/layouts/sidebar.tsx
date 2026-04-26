import { NavLink, Link, useNavigate } from "react-router-dom";
import { Home, Library, Heart, User, Music2, LogOut, Mic2, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    const restoreSession = async () => {
      if (user) return;
      try {
        const response = await fetch(`${API_BASE}/user/me`, { credentials: "include" });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.error("Scriptify: Auth sync failed.");
      }
    };
    restoreSession();
  }, [setUser, user]);

  const fetchFavs = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/favorites`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setFavouriteTracks(data);
      }
    } catch (err) {
      console.error("Scriptify: Library sync failed.");
    }
  }, [user]);

  useEffect(() => {
    fetchFavs();
    window.addEventListener('favoriteUpdate', fetchFavs);
    return () => window.removeEventListener('favoriteUpdate', fetchFavs);
  }, [fetchFavs]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } finally {
      logout();
      toast.success("Hẹn gặp lại!", { icon: "👋" });
      navigate("/login");
    }
  };

  // ✅ Hàm render nội dung NavLink để xử lý Active State cho TẤT CẢ các thẻ
  const renderNavLinkContent = (isActive: boolean, Icon: any, label: string) => (
    <>
      <Icon size={20} className={isActive ? "text-[#1DB954]" : "text-zinc-500"} />
      <span className={`text-sm ${isActive ? "text-white font-bold" : "text-zinc-500 font-semibold"}`}>
        {label}
      </span>
      {/* Thanh đèn xanh sẽ hiện ở bất cứ item nào đang Active */}
      {isActive && (
        <div className="absolute left-0 w-1 h-6 bg-[#1DB954] rounded-r-full shadow-[0_0_12px_rgba(29,185,84,0.8)]" />
      )}
    </>
  );

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-4 w-full transition-all duration-300 px-4 py-3 rounded-xl group relative overflow-hidden ${
      isActive ? 'bg-white/10' : 'hover:bg-white/5'
    }`;

  return (
    <div className="w-64 bg-[#050505] border-r border-white/5 flex flex-col h-full font-sans select-none relative z-50 shadow-2xl">
      
      {/* 🟢 User Profile Header */}
      <div className="p-6">
        {!user ? (
          <Link to="/login" className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-[#1DB954]/30 transition-all group">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-[#1DB954] group-hover:text-black transition-colors">
              <User size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-zinc-500 group-hover:text-white transition-colors">Tài khoản</span>
              <span className="text-xs font-bold text-white">Đăng nhập</span>
            </div>
          </Link>
        ) : (
          <Link to="/profile" className="block group">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/[0.08] hover:border-[#1DB954]/20 transition-all relative">
              <div className="relative shrink-0">
                <img 
                  src={getResourceUrl(user.avatarUrl)} 
                  className="w-10 h-10 rounded-full object-cover border border-white/20 group-hover:border-[#1DB954]/50 transition-all shadow-lg" 
                  alt="Avatar"
                  onError={(e) => (e.currentTarget.src = '/assets/default-avatar.png')}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#1DB954] border-2 border-black rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate leading-tight group-hover:text-[#1DB954] transition-colors">
                  {user.nickname || "Người dùng"}
                </p>
                <button onClick={handleLogout} className="text-[10px] text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors font-medium">
                  <LogOut size={10} /> Đăng xuất
                </button>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* 🟢 Navigation Menu */}
      <div className="px-3 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
        <nav className="space-y-1">
          <p className="px-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 italic">Khám phá</p>
          
          <NavLink to="/" className={navLinkClass}>
            {({ isActive }) => renderNavLinkContent(isActive, Home, "Trang chủ")}
          </NavLink>
          
          <NavLink to="/artists" className={navLinkClass}>
            {({ isActive }) => renderNavLinkContent(isActive, Mic2, "Nghệ sĩ")}
          </NavLink>
          
          <NavLink to="/albums" className={navLinkClass}>
            {({ isActive }) => renderNavLinkContent(isActive, Library, "Albums")}
          </NavLink>

          {user && (
            <NavLink to="/favorites" className={navLinkClass}>
              {({ isActive }) => renderNavLinkContent(isActive, Heart, "Yêu thích")}
            </NavLink>
          )}
        </nav>

        {/* 🟢 Cloud Vault Section */}
        {user && (
          <div className="space-y-1">
            <div className="flex items-center justify-between px-4 mb-3">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">Thư viện</p>
              <Music2 size={12} className="text-zinc-700" />
            </div>
            
            {favouriteTracks.length > 0 ? (
              <div className="space-y-0.5 px-1 max-h-[300px] overflow-y-auto custom-scrollbar-hidden">
                {favouriteTracks.map((track) => (
                  <button key={track.id} onClick={() => onPlayTrack(track.id)} className="flex items-center gap-3 w-full p-2 rounded-xl text-left hover:bg-white/5 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 overflow-hidden flex items-center justify-center shrink-0 border border-white/5">
                      {track.imageUrl ? (
                        <img src={getResourceUrl(track.imageUrl)} className="w-full h-full object-cover" />
                      ) : (
                        <Music2 size={16} className="text-zinc-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-200 truncate group-hover:text-[#1DB954] transition-colors">{track.title}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{track.artist?.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mx-4 p-6 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center">
                 <p className="text-[10px] text-zinc-600 italic">Trống rỗng...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🟢 Footer Actions */}
      <div className="p-4 mt-auto space-y-1 border-t border-white/5">
        <NavLink to="/disclaimer" className={navLinkClass}>
           {({ isActive }) => renderNavLinkContent(isActive, ShieldCheck, "Bản quyền")}
        </NavLink>
        {user?.role === "ADMIN" && (
          <NavLink to="/admin" className="flex items-center gap-4 w-full px-4 py-3 rounded-xl bg-[#1DB954]/10 text-[#1DB954] border border-[#1DB954]/20 hover:bg-[#1DB954]/20 transition-all group">
            <LayoutDashboard size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-tight">Quản trị</span>
          </NavLink>
        )}
      </div>
    </div>
  );
}