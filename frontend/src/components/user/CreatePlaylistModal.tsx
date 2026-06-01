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
        toast.success("Đã tạo Playlist mới!");
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
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden transition-colors duration-300"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full transition-colors" />

            <div className="flex justify-between items-center mb-8">
              <h2 className="text-sm font-black text-foreground uppercase italic tracking-[0.2em] flex items-center gap-3 transition-colors">
                <div className="p-2 rounded-lg bg-primary/10 transition-colors">
                   <Music2 className="text-primary" size={18} />
                </div>
                New Playlist
              </h2>
              
              <button 
                type="button"
                onClick={onClose} 
                className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all z-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center mb-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-36 h-36 rounded-2xl border-2 border-dashed border-border bg-secondary/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative group shadow-lg"
                >
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Preview" />
                  ) : (
                    <>
                      <Camera size={28} className="text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                      <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest italic transition-colors">Add Cover</span>
                    </>
                  )}
                  <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                     <Camera size={24} className="text-foreground" />
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic transition-colors group-focus-within:text-primary">Playlist Name</label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Giai điệu đang chill..."
                  className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-primary/40 transition-all placeholder:text-muted-foreground/50 font-medium shadow-sm"
                />
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic transition-colors group-focus-within:text-primary">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Vài dòng cảm xúc cho list này sếp ơi..."
                  rows={2}
                  className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-primary/40 transition-all resize-none placeholder:text-muted-foreground/50 font-medium shadow-sm"
                />
              </div>

              <div className="flex items-center justify-between p-5 bg-secondary/30 rounded-2xl border border-border group hover:bg-secondary/50 transition-colors shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl transition-colors ${isPublic ? 'bg-primary/10' : 'bg-background'}`}>
                    {isPublic ? <Globe size={18} className="text-primary" /> : <Lock size={18} className="text-muted-foreground" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-foreground uppercase tracking-wider transition-colors">Public Mode</span>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase italic transition-colors">{isPublic ? 'Everyone' : 'Only You'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isPublic ? 'bg-primary' : 'bg-secondary'}`}
                >
                  <motion.div animate={{ x: isPublic ? 26 : 4 }} className="absolute top-1 w-4 h-4 bg-primary-foreground rounded-full shadow-md border border-border/50" />
                </button>
              </div>

              <button
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-4 rounded-2xl transition-all shadow-[0_10px_30px_rgba(var(--primary),0.2)] active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs italic flex items-center justify-center gap-2"
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