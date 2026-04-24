import React, { useState } from "react";
import { ShieldCheck, Plus, Music2, Mic2, Library, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

// Import các sections
import { SongSection } from "./sections/SongSection";
import { ArtistSection } from "./sections/ArtistSection";
import { AlbumSection } from "./sections/AlbumSection";
import { UserSection } from "./sections/UserSection";
import { EntityDialog } from "./sections/EntityDialog";

// ✅ Dùng đường dẫn tương đối để đi xuyên qua Proxy nội bộ
const API_BASE = "/api";

export function AdminDashboard() {
  const [mainTab, setMainTab] = useState("music");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  
  // Lấy token từ Store để đảm bảo tính reactive
  const { token } = useAuthStore();

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  const handleDelete = async (path: string, id: number) => {
    if (!window.confirm("Bồ chắc chắn muốn xoá mục này chứ? Thao tác này không thể hoàn tác!")) return;
    
    try {
      const res = await fetch(`${API_BASE}/${path}/${id}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "credentials": "include" // Giữ credentials nếu BE cần check session kèm token
        }
      });

      if (res.ok) {
        toast.success("Xoá thành công khỏi Cloud!");
        triggerRefresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || "Không thể xoá. Hãy check ràng buộc dữ liệu (ví dụ: nghệ sĩ vẫn còn bài hát)!");
      }
    } catch (err) {
      toast.error("Lỗi kết nối Proxy khi thực hiện xoá.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 selection:bg-green-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER CONTROL */}
        <div className="flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-4 text-green-500">
              <ShieldCheck className="w-12 h-12 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" /> 
              SCRIPTIFY ADMIN
            </h1>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] italic mt-2 ml-16">
              Hệ thống quản trị nội dung trung tâm
            </p>
          </div>

          {mainTab !== "user" && (
            <Button 
              onClick={() => { setEditItem(null); setDialogOpen(true); }}
              className="bg-green-500 text-black font-black px-8 h-14 rounded-[1.5rem] hover:scale-105 transition-all shadow-xl shadow-green-500/10 active:scale-95 italic text-sm tracking-tighter"
            >
              <Plus className="mr-2 w-6 h-6 stroke-[3px]" /> THÊM MỚI
            </Button>
          )}
        </div>

        {/* TABS MANAGEMENT */}
        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-8">
          <TabsList className="bg-zinc-950 border border-white/5 p-1.5 rounded-2xl h-14 shadow-inner">
            <TabsTrigger value="music" className="gap-2 px-8 rounded-xl font-black uppercase italic text-[11px] tracking-widest data-[state=active]:bg-green-500 data-[state=active]:text-black transition-all">
              <Music2 size={16}/> Nhạc
            </TabsTrigger>
            <TabsTrigger value="artists" className="gap-2 px-8 rounded-xl font-black uppercase italic text-[11px] tracking-widest data-[state=active]:bg-green-500 data-[state=active]:text-black transition-all">
              <Mic2 size={16}/> Nghệ sĩ
            </TabsTrigger>
            <TabsTrigger value="albums" className="gap-2 px-8 rounded-xl font-black uppercase italic text-[11px] tracking-widest data-[state=active]:bg-green-500 data-[state=active]:text-black transition-all">
              <Library size={16}/> Albums
            </TabsTrigger>
            <TabsTrigger value="user" className="gap-2 px-8 rounded-xl font-black uppercase italic text-[11px] tracking-widest data-[state=active]:bg-green-500 data-[state=active]:text-black transition-all">
              <UsersIcon size={16}/> Users
            </TabsTrigger>
          </TabsList>

          {/* SECTIONS RENDER */}
          <div className="bg-zinc-950/50 rounded-[2.5rem] border border-white/5 p-8 min-h-[600px] backdrop-blur-sm">
            <TabsContent value="music" className="mt-0 focus-visible:outline-none">
              <SongSection 
                refresh={refreshTrigger} 
                onDelete={(id) => handleDelete("songs", id)} 
                onEdit={(item) => { setEditItem(item); setDialogOpen(true); }} 
              />
            </TabsContent>

            <TabsContent value="artists" className="mt-0 focus-visible:outline-none">
              <ArtistSection 
                refresh={refreshTrigger} 
                onDelete={(id) => handleDelete("artists", id)} 
                onEdit={(item) => { setEditItem(item); setDialogOpen(true); }} 
              />
            </TabsContent>

            <TabsContent value="albums" className="mt-0 focus-visible:outline-none">
              <AlbumSection 
                refresh={refreshTrigger} 
                onDelete={(id) => handleDelete("albums", id)} 
                onEdit={(item) => { setEditItem(item); setDialogOpen(true); }} 
              />
            </TabsContent>

            <TabsContent value="user" className="mt-0 focus-visible:outline-none">
              <UserSection 
                refresh={refreshTrigger} 
                onDelete={(id) => handleDelete("user", id)} 
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* POPUP QUẢN LÝ THỰC THỂ */}
      <EntityDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        type={mainTab as any} 
        editItem={editItem}
        onSuccess={triggerRefresh}
      />
    </div>
  );
}