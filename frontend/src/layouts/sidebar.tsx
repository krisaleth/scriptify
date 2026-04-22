import { NavLink, Link, useNavigate } from "react-router-dom";
import { Home, Library, Heart, User, Music2, LogOut, Mic2, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from "@/store/useAuthStore";
import { getResourceUrl } from "@/utils/urlHelper";
import { toast } from "sonner";

export function Sidebar({ onPlayTrack }: { onPlayTrack: (id: number) => void }) {
  const navigate = useNavigate();
  
  // 1. Dùng Selector lẻ để React theo dõi sát sao sự thay đổi của User
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  
  const [favouriteTracks, setFavouriteTracks] = useState<any[]>([]);

  // 2. Fetch danh sách Yêu thích
  const fetchFavs = async () => {
    if (!token) {
      setFavouriteTracks([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/api/favorites`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFavouriteTracks(data); 
      }
    } catch (err) {
      console.error("Lỗi fetch favs:", err);
    }
  };

  useEffect(() => {
    fetchFavs();
    window.addEventListener('favoriteUpdate', fetchFavs);
    return () => window.removeEventListener('favoriteUpdate', fetchFavs);
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    toast.success("Đã đăng xuất");
    navigate("/login");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-4 w-full transition-all duration-300 px-4 py-3 rounded-xl group ${
      isActive ? 'text-green-500 font-black bg-white/5' : 'text-zinc-500 hover:text-white hover:bg-white/5'
    }`;

  return (
    <div className="w-64 bg-black border-r border-white/5 flex flex-col h-full font-sans select-none relative z-50">
      <div className="p-6 mb-2">
        {!user ? (
          <Link to="/login" className="flex items-center gap-4 text-zinc-400 hover:text-white transition-all group bg-zinc-900/40 p-4 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Đăng nhập</span>
          </Link>
        ) : (
          <div className="flex items-center gap-4 p-2 animate-in fade-in duration-500">
            <div className="relative flex-shrink-0 group">
              <img 
                // Sử dụng getResourceUrl đã bọc encodeURI để xử lý khoảng trắng
                src={getResourceUrl(user.avatarUrl)} 
                className="w-12 h-12 rounded-full object-cover border-2 border-zinc-800 group-hover:border-green-500 transition-all duration-500"
                alt="Avatar"
                onError={(e) => {
                  const target = e.currentTarget;
                  // CHẶN VÒNG LẶP: Chỉ đổi sang default nếu hiện tại KHÔNG PHẢI là default
                  if (!target.src.includes('/assets/default-avatar.png')) {
                    target.src = '/assets/default-avatar.png';
                  }
                }}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full shadow-lg"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black truncate text-sm uppercase tracking-tighter italic">
                {user.username}
              </p>
              <button onClick={handleLogout} className="text-[9px] text-zinc-600 hover:text-red-500 flex items-center gap-1 mt-1 transition-colors uppercase font-black">
                <LogOut className="w-2.5 h-2.5" /> Thoát
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
        <nav className="space-y-1.5">
          <NavLink to="/" className={navLinkClass}>
            <Home className="w-5 h-5" />
            <span className="text-[13px] font-bold uppercase tracking-tight">Trang chủ</span>
          </NavLink>
          <NavLink to="/artists" className={navLinkClass}>
            <Mic2 className="w-5 h-5" />
            <span className="text-[13px] font-bold uppercase tracking-tight">Nghệ sĩ</span>
          </NavLink>
          <NavLink to="/albums" className={navLinkClass}>
            <Library className="w-5 h-5" />
            <span className="text-[13px] font-bold uppercase tracking-tight">Albums</span>
          </NavLink>
          {user && (
            <NavLink to="/favorites" className={navLinkClass}>
              <Heart className="w-5 h-5" />
              <span className="text-[13px] font-bold uppercase tracking-tight">Yêu thích</span>
            </NavLink>
          )}
        </nav>

        {user && (
          <div className="pt-2">
            <div className="flex items-center justify-between px-4 mb-5">
              <h3 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.25em] italic">Cloud Library</h3>
              <div className="h-[1px] flex-1 bg-white/5 ml-4"></div>
            </div>
            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar-hidden">
              {favouriteTracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => onPlayTrack(track.id)}
                  className="flex items-center gap-3 text-zinc-500 hover:text-green-400 transition-all w-full p-2 px-4 rounded-xl text-left group hover:bg-green-500/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-green-500/30 transition-all">
                    <Music2 className="w-3.5 h-3.5 text-zinc-700 group-hover:text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0 text-xs font-bold uppercase tracking-tighter truncate">
                    {track.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {user?.role === "ADMIN" && (
        <div className="p-4 mt-auto">
          <NavLink to="/admin" className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-green-500 text-black font-black text-[11px] uppercase tracking-widest hover:bg-green-400 active:scale-95 transition-all shadow-lg shadow-green-500/20">
            <ShieldCheck className="w-5 h-5" /> Quản trị viên
          </NavLink>
        </div>
      )}
    </div>
  );
}