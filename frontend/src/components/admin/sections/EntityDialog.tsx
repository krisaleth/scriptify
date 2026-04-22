import React, { useState, useEffect } from "react";
import { Loader2, Music, User, Album, Calendar, FileAudio, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const API_BASE = "http://localhost:8080/api";
const inputClasses = "border-zinc-800 bg-zinc-950 text-white focus-visible:ring-green-500 focus-visible:border-green-800 rounded-xl h-12 transition-all placeholder:text-zinc-700";

interface EntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: string; // 'music' | 'artists' | 'albums'
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

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (open) {
      // Load Artists
      if (type === 'music' || type === 'albums') {
        fetch(`${API_BASE}/artists/all`, { headers: { Authorization: `Bearer ${token}` } })
          .then(res => res.json())
          .then(data => setArtists(Array.isArray(data) ? data : data.content || []));
      }
      // Load Albums
      if (type === 'music') {
        fetch(`${API_BASE}/albums?size=100`, { headers: { Authorization: `Bearer ${token}` } })
          .then(res => res.json())
          .then(data => setAlbums(data.content || []));
      }

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
  }, [open, editItem, type, token]);

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
        headers: { Authorization: `Bearer ${token}` },
        body
      });

      if (res.ok) {
        toast.success("Thành công!", { description: `${editItem ? 'Cập nhật' : 'Thêm mới'} dữ liệu hoàn tất.` });
        onSuccess();
        onOpenChange(false);
      } else {
        const err = await res.json();
        toast.error("Lỗi rồi bồ ơi", { description: err.message || "Kiểm tra lại dữ liệu nhập vào nhé." });
      }
    } catch (err) {
      toast.error("Lỗi kết nối", { description: "Server Backend không phản hồi." });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const action = editItem ? "Cập nhật" : "Thêm mới";
    const entity = type === 'music' ? 'Bài hát' : type === 'artists' ? 'Nghệ sĩ' : 'Album';
    return `${action} ${entity}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg rounded-3xl p-8 shadow-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-green-500 flex items-center gap-3">
              {type === 'music' && <Music className="w-8 h-8" />}
              {type === 'artists' && <User className="w-8 h-8" />}
              {type === 'albums' && <Album className="w-8 h-8" />}
              {getTitle()}
            </DialogTitle>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Quản lý hệ thống Scriptify</p>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tên/Tiêu đề */}
            {(type === 'music' || type === 'albums') && (
              <div className="space-y-2">
                <Label className="text-zinc-400 font-bold text-[10px] uppercase ml-1">Tiêu đề</Label>
                <Input placeholder="Tên bài hát/album..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className={inputClasses} />
              </div>
            )}

            {/* Nghệ sĩ */}
            {(type === 'music' || type === 'albums') && (
              <div className="space-y-2">
                <Label className="text-zinc-400 font-bold text-[10px] uppercase ml-1">Nghệ sĩ sở hữu</Label>
                <select 
                  className={`${inputClasses} w-full p-3 outline-none appearance-none`} 
                  value={formData.artistId} 
                  onChange={e => setFormData({...formData, artistId: e.target.value, albumId: ""})} 
                  required
                >
                  <option value="" className="bg-zinc-950 text-zinc-500">-- Chọn nghệ sĩ --</option>
                  {artists.map(a => <option key={a.id} value={a.id} className="bg-zinc-950">{a.name}</option>)}
                </select>
              </div>
            )}

            {/* Album (Chỉ dành cho Music) */}
            {type === 'music' && (
              <div className="space-y-2">
                <Label className="text-zinc-400 font-bold text-[10px] uppercase ml-1">Thuộc Album</Label>
                <select 
                  className={`${inputClasses} w-full p-3 outline-none appearance-none disabled:opacity-50`} 
                  value={formData.albumId} 
                  onChange={e => setFormData({...formData, albumId: e.target.value})}
                  disabled={!formData.artistId}
                >
                  <option value="" className="bg-zinc-950 text-zinc-500">-- Chọn Album (Nếu có) --</option>
                  {albums.filter(alb => !formData.artistId || alb.artist?.id === Number(formData.artistId)).map(alb => (
                    <option key={alb.id} value={alb.id} className="bg-zinc-950">{alb.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Trường cho Nghệ sĩ */}
            {type === 'artists' && (
              <>
                <div className="space-y-2">
                  <Label className="text-zinc-400 font-bold text-[10px] uppercase ml-1">Tên nghệ sĩ</Label>
                  <Input placeholder="Tên hiển thị..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className={inputClasses} />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 font-bold text-[10px] uppercase ml-1">Tiểu sử</Label>
                  <textarea 
                    placeholder="Giới thiệu về nghệ sĩ..." 
                    value={formData.bio} 
                    onChange={e => setFormData({...formData, bio: e.target.value})} 
                    className={`${inputClasses} h-28 pt-3 resize-none w-full p-3 outline-none`} 
                  />
                </div>
              </>
            )}

            {/* Năm phát hành (Album) */}
            {type === 'albums' && (
              <div className="space-y-2">
                <Label className="text-zinc-400 font-bold text-[10px] uppercase ml-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Năm phát hành
                </Label>
                <Input type="number" placeholder="2024" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className={inputClasses} />
              </div>
            )}

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {type === 'music' && (
                <div className="space-y-2">
                  <Label className="text-zinc-400 font-bold text-[10px] uppercase ml-1 flex items-center gap-2">
                    <FileAudio className="w-3 h-3 text-green-500" /> Bản ghi MP3
                  </Label>
                  <div className="relative group">
                    <Input 
                      type="file" 
                      accept="audio/*" 
                      onChange={e => setFiles({...files, song: e.target.files?.[0]})} 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-12"
                    />
                    <div className="h-12 border border-zinc-800 bg-zinc-900 rounded-xl px-4 flex items-center text-xs text-zinc-500 group-hover:border-green-500/50 transition-all">
                      <span className="truncate">{files.song ? files.song.name : "Chọn file nhạc..."}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-zinc-400 font-bold text-[10px] uppercase ml-1 flex items-center gap-2">
                  <ImageIcon className="w-3 h-3 text-green-500" /> Ảnh bìa (R2)
                </Label>
                <div className="relative group">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setFiles({...files, image: e.target.files?.[0]})} 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-12"
                  />
                  <div className="h-12 border border-zinc-800 bg-zinc-900 rounded-xl px-4 flex items-center text-xs text-zinc-500 group-hover:border-green-500/50 transition-all">
                    <span className="truncate">{files.image ? files.image.name : "Duyệt ảnh..."}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-green-500 text-black font-black py-7 rounded-2xl hover:bg-green-400 transition-all active:scale-95 shadow-lg shadow-green-500/10"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "XÁC NHẬN CẬP NHẬT"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}