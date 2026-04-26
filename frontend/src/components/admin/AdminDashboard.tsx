import React, { useState, useMemo } from "react";
import { ShieldCheck, Plus, Music2, Mic2, Library, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Import các components con
import { SongSection } from "./sections/SongSection";
import { ArtistSection } from "./sections/ArtistSection";
import { AlbumSection } from "./sections/AlbumSection";
import { UserSection } from "./sections/UserSection";
import { EntityDialog } from "./sections/EntityDialog";
import { AdminSearchControl } from "./sections/AdminSearchControl";
import { apiRequest } from "@/utils/apiClient"; // ✅ Dùng người gác cổng thông minh

const API_BASE = "/api";

export function AdminDashboard() {
  const [mainTab, setMainTab] = useState("music");
  const [searchQuery, setSearchQuery] = useState(""); 
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  
  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Thay đổi placeholder theo tab
  const searchPlaceholder = useMemo(() => {
    switch (mainTab) {
      case "music": return "Tìm tên bài hát...";
      case "artists": return "Tìm nghệ sĩ...";
      case "albums": return "Tìm tiêu đề album...";
      case "user": return "Tìm email/nickname...";
      default: return "Nhập nội dung cần tìm...";
    }
  }, [mainTab]);

  // ✅ Sử dụng apiRequest để xóa (Tự lo phần credentials/cookie)
  const handleDelete = async (path: string, id: number) => {
    if (!window.confirm("bạn chắc chắn muốn xoá mục này chứ? Thao tác này không thể hoàn tác!")) return;
    
    try {
      const res = await apiRequest(`${API_BASE}/${path}/${id}`, {
        method: "DELETE",
      });

      toast.success("Xoá thành công khỏi Cloud!");
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.message || "Không thể xoá. Hãy check ràng buộc dữ liệu!");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 selection:bg-green-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER AREA */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-4 text-green-500">
              <ShieldCheck className="w-12 h-12 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" /> 
              SCRIPTIFY ADMIN
            </h1>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] italic mt-2 ml-16">
              Cloud Control Center
            </p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            {/* THANH SEARCH CÙNG CẤP VỚI NÚT THÊM */}
            <AdminSearchControl 
              placeholder={searchPlaceholder} 
              onSearch={setSearchQuery} 
              tabValue={mainTab} 
            />

            {mainTab !== "user" && (
              <Button 
                onClick={() => { setEditItem(null); setDialogOpen(true); }}
                className="bg-green-500 text-black font-black px-6 h-12 rounded-xl hover:scale-105 transition-all shadow-lg italic shrink-0"
              >
                <Plus className="mr-2 w-5 h-5 stroke-[3px]" /> THÊM
              </Button>
            )}
          </div>
        </div>

        {/* TABS & SECTIONS */}
        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
          <TabsList className="bg-zinc-950 border border-white/5 p-1.5 rounded-2xl h-14 w-full justify-start overflow-x-auto no-scrollbar sm:w-auto">
            <TabsTrigger value="music" className="px-8 rounded-xl font-black uppercase italic text-[10px] tracking-widest data-[state=active]:bg-green-500 data-[state=active]:text-black">Nhạc</TabsTrigger>
            <TabsTrigger value="artists" className="px-8 rounded-xl font-black uppercase italic text-[10px] tracking-widest data-[state=active]:bg-green-500 data-[state=active]:text-black">Nghệ sĩ</TabsTrigger>
            <TabsTrigger value="albums" className="px-8 rounded-xl font-black uppercase italic text-[10px] tracking-widest data-[state=active]:bg-green-500 data-[state=active]:text-black">Albums</TabsTrigger>
            <TabsTrigger value="user" className="px-8 rounded-xl font-black uppercase italic text-[10px] tracking-widest data-[state=active]:bg-green-500 data-[state=active]:text-black">Users</TabsTrigger>
          </TabsList>

          <div className="bg-zinc-900/10 rounded-[2.5rem] border border-white/5 p-8 min-h-[600px] backdrop-blur-md shadow-2xl relative">
            <TabsContent value="music" className="mt-0 outline-none">
              <SongSection 
                searchQuery={searchQuery} 
                refresh={refreshTrigger} 
                onDelete={(id) => handleDelete("songs", id)} 
                onEdit={(item) => { setEditItem(item); setDialogOpen(true); }} 
              />
            </TabsContent>

            <TabsContent value="artists" className="mt-0 outline-none">
              <ArtistSection 
                searchQuery={searchQuery} 
                refresh={refreshTrigger} 
                onDelete={(id) => handleDelete("artists", id)} 
                onEdit={(item) => { setEditItem(item); setDialogOpen(true); }} 
              />
            </TabsContent>

            <TabsContent value="albums" className="mt-0 outline-none">
              <AlbumSection 
                searchQuery={searchQuery} 
                refresh={refreshTrigger} 
                onDelete={(id) => handleDelete("albums", id)} 
                onEdit={(item) => { setEditItem(item); setDialogOpen(true); }} 
              />
            </TabsContent>

            <TabsContent value="user" className="mt-0 outline-none">
              <UserSection 
                searchQuery={searchQuery} 
                refresh={refreshTrigger} 
                onDelete={(id) => handleDelete("user", id)} 
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <EntityDialog 
        open={dialogOpen} onOpenChange={setDialogOpen}
        type={mainTab as any} editItem={editItem} onSuccess={triggerRefresh}
      />
    </div>
  );
}