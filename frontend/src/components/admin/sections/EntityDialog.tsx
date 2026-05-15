import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Music, User, Album, Calendar, FileAudio, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// ✅ Dùng đường dẫn tương đối để đi xuyên qua Proxy nội bộ Docker
const API_BASE = "/api"; 
const inputClasses = "border-white/5 bg-zinc-950 text-white focus-visible:ring-green-500/30 focus-visible:border-green-500/20 rounded-2xl h-14 transition-all placeholder:text-zinc-800 italic text-sm";

interface EntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: string; 
  editItem: any | null;
  onSuccess: () => void;
}

export function EntityDialog({ open, onOpenChange, type, editItem, onSuccess }: EntityDialogProps) {
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: "", artistId: "", albumId: "", year: "", name: "", bio: ""
  });
  const [files, setFiles] = useState<{ song?: File; image?: File }>({});

  // 1. Hàm load Options (Nghệ sĩ/Album) qua Proxy
  const loadOptions = useCallback(async () => {
    const fetchOptions = {
      credentials: "include" as const, 
    };

    if (type === 'music' || type === 'albums') {
      try {
        const res = await fetch(`${API_BASE}/artists`, fetchOptions);
        if (res.ok) {
          const data = await res.json();
          setArtists(Array.isArray(data) ? data : data.content || []);
        }
      } catch (e) { console.error("Scriptify: Lỗi tải danh sách nghệ sĩ", e); }
    }

    if (type === 'music') {
      try {
        const res = await fetch(`${API_BASE}/albums?size=100`, fetchOptions);
        if (res.ok) {
          const data = await res.json();
          setAlbums(data.content || []);
        }
      } catch (e) { console.error("Scriptify: Lỗi tải danh sách album", e); }
    }
  }, [type]);

  useEffect(() => {
    if (open) {
      loadOptions();
      if (editItem) {
        setFormData({
          title: editItem.title || "",
          artistId: editItem.artist?.id?.toString() || "",
          albumId: editItem.album?.id?.toString() || "",
          year: editItem.releaseYear || "",
          name: editItem.name || "",
          bio: editItem.bio || ""
        });
      } else {
        setFormData({ title: "", artistId: "", albumId: "", year: "", name: "", bio: "" });
      }
      setFiles({});
    }
  }, [open, editItem, loadOptions]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const body = new FormData();
    const endpointMap: Record<string, string> = { music: "songs", artists: "artists", albums: "albums" };
    const endpoint = endpointMap[type];

    if (type === "music") {
      body.append("title", formData.title);
      body.append("artistId", formData.artistId);
      if (formData.albumId) body.append("albumId", formData.albumId);
      if (files.song) body.append("songFile", files.song);
      if (files.image) body.append("imageFile", files.image);
    } else if (type === "artists") {
      body.append("name", formData.name);
      body.append("bio", formData.bio);
      if (files.image) body.append("imageFile", files.image);
    } else if (type === "albums") {
      body.append("title", formData.title);
      body.append("releaseYear", formData.year);
      body.append("artistId", formData.artistId);
      if (files.image) body.append("imageFile", files.image);
    }

    const url = editItem ? `${API_BASE}/${endpoint}/${editItem.id}` : `${API_BASE}/${endpoint}`;

    try {
      const res = await fetch(url, {
        method: editItem ? "PUT" : "POST",
        credentials: "include", 
        body
      });

      if (res.ok) {
        toast.success("Đã đồng bộ Cloud!", { description: "Dữ liệu mới đã sẵn sàng trên Scriptify." });
        onSuccess();
        onOpenChange(false);
      } else {
        const err = await res.json();
        toast.error("Thất bại", { description: err.message || "Vui lòng kiểm tra lại định dạng file bạn nhé." });
      }
    } catch (err) {
      toast.error("Lỗi kết nối Proxy", { description: "Hãy chắc chắn Nginx Proxy đang chạy mượt mà." });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const action = editItem ? "Cập nhật" : "Thêm mới";
    const entity = type === 'music' ? 'Giai điệu' : type === 'artists' ? 'Nghệ sĩ' : 'Album';
    return `${action} ${entity}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/5 text-white max-w-lg rounded-[2.5rem] p-10 shadow-3xl overflow-hidden">
        <form onSubmit={handleSave} className="space-y-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-green-500 flex items-center gap-4">
              {type === 'music' && <Music className="w-10 h-10" />}
              {type === 'artists' && <User className="w-10 h-10" />}
              {type === 'albums' && <Album className="w-10 h-10" />}
              {getTitle()}
            </DialogTitle>
            <div className="h-1 w-20 bg-green-500/20 rounded-full mt-2"></div>
          </DialogHeader>

          <div className="space-y-5">
            {(type === 'music' || type === 'albums') && (
              <div className="space-y-2">
                <Label className="text-zinc-500 font-black text-[10px] uppercase ml-1 italic tracking-widest">Tiêu đề bản phối</Label>
                <Input placeholder="Tên tác phẩm..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className={inputClasses} />
              </div>
            )}

            {(type === 'music' || type === 'albums') && (
              <div className="space-y-2">
                <Label className="text-zinc-500 font-black text-[10px] uppercase ml-1 italic tracking-widest">Nghệ sĩ định danh</Label>
                <select 
                  className={`${inputClasses} w-full p-4 outline-none appearance-none cursor-pointer border border-white/5`} 
                  value={formData.artistId} 
                  onChange={e => setFormData({...formData, artistId: e.target.value, albumId: ""})} 
                  required
                >
                  <option value="" className="bg-zinc-950 text-zinc-700 italic">-- Lựa chọn nghệ sĩ --</option>
                  {artists.map(a => <option key={a.id} value={a.id} className="bg-zinc-950">{a.name}</option>)}
                </select>
              </div>
            )}

            {type === 'music' && (
              <div className="space-y-2">
                <Label className="text-zinc-500 font-black text-[10px] uppercase ml-1 italic tracking-widest">Bộ sưu tập Album</Label>
                <select 
                  className={`${inputClasses} w-full p-4 outline-none appearance-none disabled:opacity-20 cursor-pointer border border-white/5`} 
                  value={formData.albumId} 
                  onChange={e => setFormData({...formData, albumId: e.target.value})}
                  disabled={!formData.artistId}
                >
                  <option value="" className="bg-zinc-950 text-zinc-700 italic">-- Không thuộc album nào --</option>
                  {albums.filter(alb => !formData.artistId || alb.artist?.id === Number(formData.artistId)).map(alb => (
                    <option key={alb.id} value={alb.id} className="bg-zinc-950">{alb.title}</option>
                  ))}
                </select>
              </div>
            )}

            {type === 'artists' && (
              <>
                <div className="space-y-2">
                  <Label className="text-zinc-500 font-black text-[10px] uppercase ml-1 italic tracking-widest">Tên nghệ sĩ</Label>
                  <Input placeholder="Nghệ danh..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className={inputClasses} />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-500 font-black text-[10px] uppercase ml-1 italic tracking-widest">Tiểu sử nghệ sĩ</Label>
                  <textarea 
                    placeholder="Vài dòng tâm đắc về nghệ sĩ..." 
                    value={formData.bio} 
                    onChange={e => setFormData({...formData, bio: e.target.value})} 
                    className={`${inputClasses} h-32 pt-4 resize-none w-full p-4 outline-none border border-white/5`} 
                  />
                </div>
              </>
            )}

            {type === 'albums' && (
              <div className="space-y-2">
                <Label className="text-zinc-500 font-black text-[10px] uppercase ml-1 italic tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-green-500" /> Năm phát hành
                </Label>
                <Input type="number" placeholder="2026" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className={inputClasses} />
              </div>
            )}

            {/* File Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {type === 'music' && (
                <div className="space-y-2">
                  <Label className="text-zinc-600 font-black text-[9px] uppercase ml-1 italic tracking-widest flex items-center gap-2">
                    <FileAudio className="w-3 h-3 text-green-500" /> Digital Audio (MP3)
                  </Label>
                  <div className="relative group">
                    <Input 
                      type="file" 
                      accept="audio/*" 
                      onChange={e => setFiles({...files, song: e.target.files?.[0]})} 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-14"
                    />
                    <div className="h-14 border border-dashed border-white/10 bg-white/5 rounded-2xl px-5 flex items-center text-[10px] text-zinc-500 group-hover:border-green-500/50 group-hover:text-zinc-300 transition-all italic font-black uppercase">
                      <span className="truncate">{files.song ? files.song.name : "Nạp file nhạc"}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-zinc-600 font-black text-[9px] uppercase ml-1 italic tracking-widest flex items-center gap-2">
                  <ImageIcon className="w-3 h-3 text-green-500" /> {type === 'artists' ? 'Profile Image' : 'Cover Artwork'}
                </Label>
                <div className="relative group">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setFiles({...files, image: e.target.files?.[0]})} 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-14"
                  />
                  <div className="h-14 border border-dashed border-white/10 bg-white/5 rounded-2xl px-5 flex items-center text-[10px] text-zinc-500 group-hover:border-green-500/50 group-hover:text-zinc-300 transition-all italic font-black uppercase">
                    <span className="truncate">{files.image ? files.image.name : "Nạp file ảnh"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-green-500 text-black font-black py-8 rounded-[1.5rem] hover:bg-green-400 transition-all active:scale-95 shadow-2xl shadow-green-500/10 text-base italic tracking-tighter"
            >
              {loading ? <Loader2 className="animate-spin w-7 h-7" /> : "XÁC NHẬN CẬP NHẬT CLOUD"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}