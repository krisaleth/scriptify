import React, { useState, useEffect } from "react";
import { Plus, Trash2, ShieldCheck, Loader2, Search, Music2, Users as UsersIcon, Mic2, Library, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_BASE = "http://localhost:8080/api";
const inputDark = "border-zinc-700 bg-zinc-800 text-white focus:ring-green-500 w-full p-2.5 rounded-md outline-none text-sm";

export function AdminDashboard() {
  const [mainTab, setMainTab] = useState("music");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const token = localStorage.getItem("token");

  // Data States
  const [songs, setSongs] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    title: "", artistId: "", albumId: "", year: "", name: "", bio: ""
  });
  const [files, setFiles] = useState<{ song?: File; image?: File }>({});

  // 1. FETCH DATA: Đồng bộ hóa với các endpoint Backend
  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [sRes, aRes, albRes, uRes] = await Promise.all([
        fetch(`${API_BASE}/songs?size=100`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/artists/all`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/albums?size=100`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/user/all`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (sRes.ok) {
        const data = await sRes.json();
        setSongs(data.content || (Array.isArray(data) ? data : []));
      }
      if (aRes.ok) {
        const data = await aRes.json();
        setArtists(Array.isArray(data) ? data : data.content || []);
      }
      if (albRes.ok) {
        const data = await albRes.json();
        setAlbums(data.content || (Array.isArray(data) ? data : []));
      }
      if (uRes.ok) {
        const data = await uRes.json();
        // Backend trả về Page<Users> nên phải lấy .content
        setUsers(data.content || (Array.isArray(data) ? data : []));
      }
    } catch (err) { console.error("Lỗi fetch:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  // 2. SAVE: Xử lý tạo mới/cập nhật
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const body = new FormData();

    const endpointMap: Record<string, string> = { music: "songs", artists: "artists", albums: "albums" };
    const endpoint = endpointMap[mainTab];

    if (mainTab === "music") {
      body.append("title", formData.title.trim());
      body.append("artistId", formData.artistId);
      if (formData.albumId) body.append("albumId", formData.albumId);
      if (files.song) body.append("songFile", files.song);
      if (files.image) body.append("imageFile", files.image);
    } else if (mainTab === "artists") {
      body.append("name", formData.name.trim());
      body.append("bio", formData.bio.trim());
      if (files.image) body.append("imageFile", files.image);
    } else if (mainTab === "albums") {
      body.append("title", formData.title.trim());
      body.append("releaseYear", formData.year);
      body.append("artistId", formData.artistId);
      if (files.image) body.append("imageFile", files.image);
    }

    const url = editId ? `${API_BASE}/${endpoint}/${editId}` : `${API_BASE}/${endpoint}`;

    try {
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body
      });

      if (res.ok) {
        setDialogOpen(false);
        resetForm();
        loadData();
      } else {
        const err = await res.json();
        alert("Lỗi: " + (err.message || "Không thể lưu dữ liệu"));
      }
    } catch (err) { alert("Lỗi kết nối Server!"); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({ title: "", artistId: "", albumId: "", year: "", name: "", bio: "" });
    setFiles({});
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);
    if (mainTab === "music") {
      setFormData({ ...formData, title: item.title, artistId: item.artist?.id || "", albumId: item.album?.id || "" });
    } else if (mainTab === "artists") {
      setFormData({ ...formData, name: item.name, bio: item.bio || "" });
    } else if (mainTab === "albums") {
      setFormData({ ...formData, title: item.title, year: item.releaseYear || "", artistId: item.artist?.id || "" });
    }
    setDialogOpen(true);
  };

  const handleDelete = async (path: string, id: number) => {
    if (!window.confirm("Bồ chắc chắn muốn xoá?")) return;
    
    // Nếu path là 'user', endpoint thực tế là /api/user/{id}
    const deletePath = path === 'user' ? 'user' : path;

    const res = await fetch(`${API_BASE}/${deletePath}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (res.ok) loadData();
    else alert("Lỗi: Không thể xoá. Hãy kiểm tra các ràng buộc dữ liệu!");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans selection:bg-green-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-3 text-green-500">
            <ShieldCheck className="w-10 h-10" /> SCRIPTIFY ADMIN
          </h1>
          {/* Chỉ hiện nút Thêm mới cho các tab không phải User */}
          {mainTab !== "user" && (
            <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-green-500 text-black font-bold px-8 h-12 rounded-full hover:scale-105 transition-all shadow-lg shadow-green-500/20">
              <Plus className="mr-2 w-5 h-5" /> THÊM MỚI
            </Button>
          )}
        </div>

        <Tabs value={mainTab} onValueChange={(v) => { setMainTab(v); resetForm(); }} className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
            <TabsTrigger value="music" className="gap-2 px-6 rounded-lg"><Music2 size={16}/> Nhạc</TabsTrigger>
            <TabsTrigger value="artists" className="gap-2 px-6 rounded-lg"><Mic2 size={16}/> Nghệ sĩ</TabsTrigger>
            <TabsTrigger value="albums" className="gap-2 px-6 rounded-lg"><Library size={16}/> Albums</TabsTrigger>
            <TabsTrigger value="user" className="gap-2 px-6 rounded-lg"><UsersIcon size={16}/> Users</TabsTrigger>
          </TabsList>

          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden shadow-2xl rounded-2xl">
            <Table>
              <TableHeader className="bg-zinc-800/50">
                <TableRow className="border-zinc-800 text-zinc-500 uppercase text-[10px] font-bold tracking-widest h-12">
                  <TableHead className="w-[100px] text-center">Ảnh</TableHead>
                  <TableHead className="min-w-[200px]">Tiêu đề / Tên</TableHead>
                  <TableHead className="w-[180px]">{mainTab === 'user' ? 'Email' : 'Nghệ sĩ'}</TableHead>
                  {mainTab === 'music' && <TableHead className="w-[150px]">Album</TableHead>}
                  {mainTab === 'user' && <TableHead className="w-[100px] text-center">Role</TableHead>}
                  <TableHead className="text-right pr-8 w-[120px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(mainTab === 'music' ? songs : mainTab === 'artists' ? artists : mainTab === 'albums' ? albums : users).map((item) => (
                  <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-800/40 transition-colors group h-20">
                    <TableCell className="text-center">
                      <img 
                        src={item.imageUrl || item.coverImageUrl || item.avatarUrl ? (item.imageUrl || item.coverImageUrl || item.avatarUrl).startsWith('http') ? (item.imageUrl || item.coverImageUrl || item.avatarUrl) : `${API_BASE}${item.imageUrl || item.coverImageUrl || item.avatarUrl}` : "/default.png"} 
                        className={`w-12 h-12 inline-block object-cover border border-zinc-700 shadow-md ${mainTab === 'artists' || mainTab === 'user' ? 'rounded-full' : 'rounded-md'}`} 
                        onError={(e) => e.currentTarget.src = "/default.png"}
                      />
                    </TableCell>
                    <TableCell className="font-bold text-zinc-200">{item.title || item.name || item.nickname}</TableCell>
                    <TableCell className="text-zinc-400 text-xs italic">
                        {mainTab === 'user' ? item.email : (item.artist?.name || "Single / N/A")}
                    </TableCell>
                    {mainTab === 'music' && (
                      <TableCell className="text-zinc-500 text-xs italic">{item.album?.title || "Single"}</TableCell>
                    )}
                    {mainTab === 'user' && (
                      <TableCell className="text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${item.role === 'ADMIN' ? 'bg-red-500/20 text-red-500' : 'bg-zinc-700 text-zinc-300'}`}>{item.role}</span>
                      </TableCell>
                    )}
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-2">
                        {/* Tab User chỉ cho xoá, không sửa trực tiếp ở đây để đảm bảo bảo mật */}
                        {mainTab !== 'user' && <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="text-blue-400 hover:bg-blue-400/10 h-8 w-8"><Pencil size={14}/></Button>}
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(mainTab === 'music' ? 'songs' : mainTab === 'user' ? 'user' : mainTab, item.id)} className="text-red-500 hover:bg-red-500/10 h-8 w-8"><Trash2 size={14}/></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Tabs>

        {/* Form Dialog chỉ dùng cho Nhạc, Nghệ sĩ, Album */}
        <Dialog open={dialogOpen} onOpenChange={(open) => { if(!open) resetForm(); setDialogOpen(open); }}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md rounded-2xl">
            <form onSubmit={handleSave} className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-green-500 text-2xl font-black italic uppercase">
                  {editId ? "Cập nhật" : "Thêm mới"} {mainTab}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {(mainTab === 'music' || mainTab === 'albums') && (
                  <Input placeholder="Tiêu đề" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className={inputDark} />
                )}

                {(mainTab === 'music' || mainTab === 'albums') && (
                  <select className={inputDark} value={formData.artistId} onChange={e => setFormData({...formData, artistId: e.target.value, albumId: ""})} required>
                    <option value="">-- Chọn nghệ sĩ --</option>
                    {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                )}

                {mainTab === 'music' && (
                  <select className={inputDark} value={formData.albumId} onChange={e => setFormData({...formData, albumId: e.target.value})}>
                    <option value="">-- Chọn Album (Nếu có) --</option>
                    {albums.filter(alb => !formData.artistId || alb.artist?.id === Number(formData.artistId)).map(alb => (
                      <option key={alb.id} value={alb.id}>{alb.title}</option>
                    ))}
                  </select>
                )}

                {mainTab === 'artists' && (
                  <>
                    <Input placeholder="Tên nghệ sĩ" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className={inputDark} />
                    <textarea placeholder="Tiểu sử..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className={`${inputDark} h-24 pt-2`} />
                  </>
                )}

                {mainTab === 'albums' && <Input type="number" placeholder="Năm phát hành" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className={inputDark} />}

                <div className="grid grid-cols-2 gap-4">
                  {mainTab === 'music' && (
                    <div><label className="text-[10px] font-bold text-zinc-500 mb-1 block uppercase">File MP3</label>
                    <Input type="file" accept="audio/*" onChange={e => setFiles({...files, song: e.target.files?.[0]})} className={inputDark} /></div>
                  )}
                  <div><label className="text-[10px] font-bold text-zinc-500 mb-1 block uppercase">Ảnh/Bìa</label>
                  <Input type="file" accept="image/*" onChange={e => setFiles({...files, image: e.target.files?.[0]})} className={inputDark} /></div>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={loading} className="w-full bg-green-500 text-black font-black py-6 rounded-xl hover:bg-green-400">
                  {loading ? <Loader2 className="animate-spin" /> : "XÁC NHẬN"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}