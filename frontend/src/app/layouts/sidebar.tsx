import { NavLink, Link, useNavigate } from "react-router-dom";
import { Home, Library, Heart, User, Music2, LogOut, Mic2, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

interface UserProfile {
  username: string;
  avatarUrl: string;
  role: string;
}

// 1. Thêm interface cho Props để nhận hàm phát nhạc từ cha (MusicApp)
interface SidebarProps {
  onPlayTrack: (id: number) => void;
}

const API_BASE = "http://localhost:8080/api";

export function Sidebar({ onPlayTrack }: SidebarProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [favouriteTracks, setFavouriteTracks] = useState<any[]>([]);
  const token = localStorage.getItem("token");

  // Fetch Profile User
  const fetchProfile = async () => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/user/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error("Lỗi fetch profile:", err);
    }
  };

  // Fetch danh sách Yêu thích
  const fetchFavs = async () => {
    if (!token) {
      setFavouriteTracks([]);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/favorites`, {
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
    fetchProfile();
    fetchFavs();
    window.addEventListener('favoriteUpdate', fetchFavs);
    window.addEventListener('focus', fetchFavs);
    return () => {
      window.addEventListener('favoriteUpdate', fetchFavs);
      window.addEventListener('focus', fetchFavs);
    };
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setFavouriteTracks([]);
    navigate("/login");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-4 w-full transition-all duration-200 px-4 py-3 rounded-lg group ${
      isActive ? 'text-green-500 font-bold bg-zinc-900 shadow-inner' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
    }`;

  return (
    <div className="w-64 bg-black border-r border-zinc-800 flex flex-col h-full font-sans select-none shadow-2xl">
      
      {/* Account Section */}
      <div className="p-6 border-b border-zinc-900 bg-gradient-to-b from-zinc-900/20 to-black">
        {!user ? (
          <Link to="/login" className="flex items-center gap-3 text-zinc-400 hover:text-white transition group bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 hover:border-zinc-600">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 group-hover:scale-110 transition-all">
              <User className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold tracking-tight uppercase">Đăng nhập</p>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <div className="relative group">
               <img 
                src={user.avatarUrl ? `${API_BASE}${user.avatarUrl}` : "/default-avatar.png"} 
                className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700 group-hover:border-green-500 transition-colors"
                alt="Avatar"
                onError={(e) => e.currentTarget.src = "/default-avatar.png"}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full shadow-lg"></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-white font-black truncate text-sm uppercase tracking-tighter">{user.username}</p>
              <button 
                onClick={handleLogout}
                className="text-[10px] text-zinc-500 hover:text-red-500 flex items-center gap-1 mt-1 transition-all uppercase font-bold"
              >
                <LogOut className="w-3 h-3" /> Thoát
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-6">
        <nav className="space-y-1">
          <NavLink to="/" className={navLinkClass}>
            <Home className="w-5 h-5" />
            <span className="text-sm tracking-wide">Trang chủ</span>
          </NavLink>
          <NavLink to="/artists" className={navLinkClass}>
            <Mic2 className="w-5 h-5" />
            <span className="text-sm tracking-wide">Nghệ sĩ</span>
          </NavLink>
          <NavLink to="/albums" className={navLinkClass}>
            <Library className="w-5 h-5" />
            <span className="text-sm tracking-wide">Albums</span>
          </NavLink>
          {user && (
            <NavLink to="/favorites" className={navLinkClass}>
              <Heart className="w-5 h-5" />
              <span className="text-sm tracking-wide">Yêu thích</span>
            </NavLink>
          )}
        </nav>

        {/* THƯ VIỆN CÁ NHÂN */}
        {user && (
          <div className="pt-4 border-t border-zinc-900">
            <div className="flex items-center justify-between px-4 mb-4">
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] italic">
                Your Library
              </h3>
              <Heart size={12} className="text-green-500 fill-current opacity-50" />
            </div>
            
            <div className="space-y-0.5 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {favouriteTracks.length > 0 ? (
                favouriteTracks.slice(0, 20).map((track) => (
                  <button
                    key={track.id}
                    onClick={() => onPlayTrack(track.id)}
                    className="flex items-center gap-3 text-sm text-zinc-500 hover:text-white transition-all w-full p-2 px-3 rounded-md text-left group hover:bg-zinc-800/30"
                  >
                    <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/10 transition-colors">
                      <Music2 className="w-3.5 h-3.5 text-zinc-700 group-hover:text-green-500" />
                    </div>
                    <span className="truncate font-medium">{track.title}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
                  <p className="text-[10px] text-zinc-600 italic font-bold">Thư viện đang trống...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Admin Panel Button */}
      {user?.role === "ADMIN" && (
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
          <NavLink to="/admin" className="flex items-center justify-center gap-3 w-full p-3.5 rounded-xl bg-green-500 text-black hover:bg-green-400 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-green-500/20">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-black text-xs uppercase tracking-widest">Admin Dashboard</span>
          </NavLink>
        </div>
      )}
    </div>
  );
}