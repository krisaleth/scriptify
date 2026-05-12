import { NavLink, Link, useNavigate } from "react-router-dom";
import { Home, Library, Heart, User, Music2, LogOut, Mic2, ShieldCheck, LayoutDashboard, Sun, Moon } from 'lucide-react';
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
  // State để theo dõi chế độ nền hiện tại
  const [isLightMode, setIsLightMode] = useState(false);

  // Kiểm tra xem app đang ở chế độ nào khi vừa load xong
  useEffect(() => {
    setIsLightMode(document.documentElement.classList.contains('light'));
  }, []);

  // Hàm xử lý việc chuyển đổi bật/tắt Light mode
  const toggleTheme = () => {
    // Logic chuẩn: Tự động đổi class 'dark' ở thẻ HTML cha
    const hasDarkMode = document.documentElement.classList.toggle('dark');
    setIsLightMode(!hasDarkMode);
  };

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

  const renderNavLinkContent = (isActive: boolean, Icon: any, label: string) => (
    <>
      <Icon size={20} className={isActive ? "text-primary" : "text-muted-foreground"} />
      <span className={`text-sm ${isActive ? "text-foreground font-bold" : "text-muted-foreground font-semibold"}`}>
        {label}
      </span>
      {isActive && (
        <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-sm shadow-primary/50" />
      )}
    </>
  );

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-4 w-full transition-all duration-300 px-4 py-3 rounded-xl group relative overflow-hidden ${
      isActive ? 'bg-accent/80' : 'hover:bg-accent/50'
    }`;

  return (
    <div className="w-64 bg-background border-r border-border flex flex-col h-full font-sans select-none relative z-50 shadow-2xl">
      
      {/* 🟢 User Profile Header & Theme Switcher */}
      <div className="p-6 flex flex-col gap-4">
        {/* Nút Đổi màu nền (Theme Switcher) */}
        <div className="flex justify-end">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/50 border border-border hover:bg-accent hover:border-primary/50 transition-all text-muted-foreground hover:text-foreground"
            title={isLightMode ? "Chuyển sang nền tối" : "Chuyển sang nền sáng"}
          >
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>

        {/* Thông tin User */}
        {!user ? (
          <Link to="/login" className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border hover:border-primary/50 transition-all group">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <User size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-muted-foreground group-hover:text-foreground transition-colors">Tài khoản</span>
              <span className="text-xs font-bold text-foreground">Đăng nhập</span>
            </div>
          </Link>
        ) : (
          <Link to="/profile" className="block group">
            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-2xl border border-border hover:bg-accent hover:border-primary/30 transition-all relative">
              <div className="relative shrink-0">
                <img 
                  src={getResourceUrl(user.avatarUrl)} 
                  className="w-10 h-10 rounded-full object-cover border border-border group-hover:border-primary/50 transition-all shadow-md" 
                  alt="Avatar"
                  onError={(e) => (e.currentTarget.src = '/assets/default-avatar.png')}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary border-2 border-background rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                  {user.nickname || "Người dùng"}
                </p>
                <button onClick={handleLogout} className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors font-medium">
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
          <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 italic">Khám phá</p>
          
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
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">Thư viện</p>
              <Music2 size={12} className="text-muted-foreground/80" />
            </div>
            
            {favouriteTracks.length > 0 ? (
              <div className="space-y-0.5 px-1 max-h-[300px] overflow-y-auto custom-scrollbar-hidden">
                {favouriteTracks.map((track) => (
                  <button key={track.id} onClick={() => onPlayTrack(track.id)} className="flex items-center gap-3 w-full p-2 rounded-xl text-left hover:bg-accent transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden flex items-center justify-center shrink-0 border border-border">
                      {track.imageUrl ? (
                        <img src={getResourceUrl(track.imageUrl)} className="w-full h-full object-cover" />
                      ) : (
                        <Music2 size={16} className="text-muted-foreground/80" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{track.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{track.artist?.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mx-4 p-6 rounded-2xl bg-secondary/20 border border-dashed border-border text-center">
                 <p className="text-[10px] text-muted-foreground italic">Trống rỗng...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🟢 Footer Actions */}
      <div className="p-4 mt-auto space-y-1 border-t border-border">
        <NavLink to="/disclaimer" className={navLinkClass}>
           {({ isActive }) => renderNavLinkContent(isActive, ShieldCheck, "Bản quyền")}
        </NavLink>
        {user?.role === "ADMIN" && (
          <NavLink to="/admin" className="flex items-center gap-4 w-full px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all group">
            <LayoutDashboard size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-tight">Quản trị</span>
          </NavLink>
        )}
      </div>
    </div>
  );
}