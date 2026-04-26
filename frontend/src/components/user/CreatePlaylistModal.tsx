import { motion, AnimatePresence } from "framer-motion";
import { X, Music2, Globe, Lock, Save, Camera } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePlaylistModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error("Ảnh bìa không được quá 2MB sếp ơi!");
      }
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Playlist phải có tên chứ!");

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("isPublic", String(isPublic));
    
    if (imageFile) {
      formData.append("thumbnail", imageFile);
    }

    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (response.ok) {
        toast.success("Đã tạo Playlist mới!", { icon: "✨" });
        setName("");
        setDescription("");
        setImageFile(null);
        setPreview(null);
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Không thể tạo playlist");
      }
    } catch (err) {
      toast.error("Lỗi kết nối server rồi sếp!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#1DB954]/10 blur-[80px] rounded-full" />

            <div className="flex justify-between items-center mb-8">
              <h2 className="text-sm font-black text-white uppercase italic tracking-[0.2em] flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#1DB954]/10">
                   <Music2 className="text-[#1DB954]" size={18} />
                </div>
                New Playlist
              </h2>
              
              {/* ✅ NÚT X ĐÃ ĐƯỢC FIX Ở ĐÂY */}
              <button 
                type="button"
                onClick={onClose} 
                className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-all z-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center mb-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-36 h-36 rounded-2xl border-2 border-dashed border-white/10 bg-zinc-900/50 flex flex-col items-center justify-center cursor-pointer hover:border-[#1DB954]/40 transition-all overflow-hidden relative group shadow-xl"
                >
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Preview" />
                  ) : (
                    <>
                      <Camera size={28} className="text-zinc-700 mb-2 group-hover:text-[#1DB954] transition-colors" />
                      <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest italic">Add Cover</span>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <Camera size={24} className="text-white" />
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 italic">Playlist Name</label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Giai điệu đang chill..."
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#1DB954]/40 transition-all placeholder:text-zinc-800 font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 italic">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Vài dòng cảm xúc cho list này sếp ơi..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#1DB954]/40 transition-all resize-none placeholder:text-zinc-800 font-medium"
                />
              </div>

              <div className="flex items-center justify-between p-5 bg-white/[0.02] rounded-2xl border border-white/5 group hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl transition-colors ${isPublic ? 'bg-[#1DB954]/10' : 'bg-zinc-900'}`}>
                    {isPublic ? <Globe size={18} className="text-[#1DB954]" /> : <Lock size={18} className="text-zinc-500" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-zinc-200 uppercase tracking-wider">Public Mode</span>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase italic">{isPublic ? 'Everyone' : 'Only You'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isPublic ? 'bg-[#1DB954]' : 'bg-zinc-800'}`}
                >
                  <motion.div animate={{ x: isPublic ? 26 : 4 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                </button>
              </div>

              <button
                disabled={isSubmitting}
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-black py-4 rounded-2xl transition-all shadow-[0_10px_30px_rgba(29,185,84,0.2)] active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs italic flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Uploading..." : <><Save size={16} /> Create Playlist</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}