import { motion, AnimatePresence } from "framer-motion";
import { X, UserCircle, KeyRound, Save, Camera, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getResourceUrl } from "@/utils/urlHelper";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  mode: "info" | "password";
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, mode, onClose }: Props) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [nickname, setNickname] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNickname(user?.nickname || "");
      setAvatarPreview(user?.avatarUrl || "");
      setCurrentPassword("");
      setNewPassword("");
      setAvatarFile(null);
    }
  }, [isOpen, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error("Ảnh không quá 2MB sếp ơi!");
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); 
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    const endpoint = mode === "info" ? "/api/user/update-profile" : "/api/user/change-password";

    if (mode === "info") {
      formData.append("nickname", nickname);
      if (avatarFile) formData.append("avatar", avatarFile);
    } else {
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);
    }

    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        body: formData,
        credentials: "include"
      });

      if (response.ok) {
        if (mode === "info") {
          const updatedUser = await response.json();
          setUser(updatedUser);
          toast.success("Hồ sơ đã được cập nhật!");
        } else {
          toast.success("Đổi mật khẩu thành công!");
        }
        onClose();
      } else {
        const err = await response.json();
        toast.error(err.message || "Thao tác thất bại");
      }
    } catch (err) {
      toast.error("Lỗi kết nối server sếp ơi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-background/90 backdrop-blur-md" />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden transition-colors duration-300"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full transition-colors" />

            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xs font-black text-foreground uppercase italic tracking-[0.2em] flex items-center gap-3 transition-colors">
                <div className="p-2 rounded-lg bg-primary/10 transition-colors">
                  {mode === "info" ? <UserCircle className="text-primary" size={18} /> : <ShieldCheck className="text-primary" size={18} />}
                </div>
                {mode === "info" ? "Edit Profile" : "Security Settings"}
              </h2>

              <button 
                type="button" 
                onClick={onClose} 
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-secondary z-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              {mode === "info" ? (
                <>
                  <div className="space-y-2 text-center mb-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-full mx-auto bg-secondary border border-border overflow-hidden mb-2 cursor-pointer group relative shadow-md transition-colors"
                    >
                       <img 
                         src={avatarPreview.startsWith('blob') ? avatarPreview : getResourceUrl(avatarPreview)} 
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                         alt="Avatar"
                         onError={(e) => (e.currentTarget.src = "/assets/default-avatar.png")}
                       />
                       <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                         <Camera size={20} className="text-foreground" />
                       </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest italic transition-colors">Click image to upload</span>
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic transition-colors group-focus-within:text-primary">Nickname</label>
                    <input 
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/40 outline-none transition-all font-medium placeholder:text-muted-foreground/50 shadow-sm" 
                      placeholder="Tên mới của sếp..." 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic transition-colors group-focus-within:text-primary">Mật khẩu hiện tại</label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/40 outline-none transition-all placeholder:text-muted-foreground/50 shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic transition-colors group-focus-within:text-primary">Mật khẩu mới</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/40 outline-none transition-all placeholder:text-muted-foreground/50 shadow-sm" 
                    />
                  </div>
                </>
              )}

              <button
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-4 rounded-2xl transition-all shadow-[0_8px_24px_rgba(var(--primary),0.2)] flex items-center justify-center gap-2 uppercase tracking-widest text-xs italic active:scale-95 disabled:opacity-50"
              >
                {loading ? "Processing..." : <><Save size={16} /> Save Changes</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}