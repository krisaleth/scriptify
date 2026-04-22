import React, { useState } from "react";
import { ShieldCheck, Plus, Music2, Mic2, Library, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import các sections
import { SongSection } from "./sections/SongSection";
import { ArtistSection } from "./sections/ArtistSection";
import { AlbumSection } from "./sections/AlbumSection";
import { UserSection } from "./sections/UserSection";
import { EntityDialog } from "./sections/EntityDialog";

const API_BASE = "http://localhost:8080/api";

export function AdminDashboard() {
  const [mainTab, setMainTab] = useState("music");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const token = localStorage.getItem("token");

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  const handleDelete = async (path: string, id: number) => {
    if (!window.confirm("Bồ chắc chắn muốn xoá mục này chứ?")) return;
    const res = await fetch(`${API_BASE}/${path}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) triggerRefresh();
    else alert("Lỗi: Không thể xoá. Hãy check ràng buộc dữ liệu bồ nhé!");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 selection:bg-green-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-3 text-green-500">
            <ShieldCheck className="w-10 h-10" /> SCRIPTIFY ADMIN
          </h1>
          {mainTab !== "user" && (
            <Button 
              onClick={() => { setEditItem(null); setDialogOpen(true); }}
              className="bg-green-500 text-black font-bold px-8 h-12 rounded-full hover:scale-105 transition-all shadow-lg shadow-green-500/20"
            >
              <Plus className="mr-2 w-5 h-5" /> THÊM MỚI
            </Button>
          )}
        </div>

        {/* TABS & CONTENT */}
        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
            <TabsTrigger value="music" className="gap-2 px-6 rounded-lg"><Music2 size={16}/> Nhạc</TabsTrigger>
            <TabsTrigger value="artists" className="gap-2 px-6 rounded-lg"><Mic2 size={16}/> Nghệ sĩ</TabsTrigger>
            <TabsTrigger value="albums" className="gap-2 px-6 rounded-lg"><Library size={16}/> Albums</TabsTrigger>
            <TabsTrigger value="user" className="gap-2 px-6 rounded-lg"><UsersIcon size={16}/> Users</TabsTrigger>
          </TabsList>

          <TabsContent value="music">
            <SongSection refresh={refreshTrigger} onDelete={(id) => handleDelete("songs", id)} onEdit={(item) => { setEditItem(item); setDialogOpen(true); }} />
          </TabsContent>

          <TabsContent value="artists">
            <ArtistSection refresh={refreshTrigger} onDelete={(id) => handleDelete("artists", id)} onEdit={(item) => { setEditItem(item); setDialogOpen(true); }} />
          </TabsContent>

          <TabsContent value="albums">
            <AlbumSection refresh={refreshTrigger} onDelete={(id) => handleDelete("albums", id)} onEdit={(item) => { setEditItem(item); setDialogOpen(true); }} />
          </TabsContent>

          <TabsContent value="user">
            <UserSection refresh={refreshTrigger} onDelete={(id) => handleDelete("user", id)} />
          </TabsContent>
        </Tabs>
      </div>

      <EntityDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        type={mainTab} // 'music' | 'artists' | 'albums'
        editItem={editItem}
        onSuccess={triggerRefresh}
      />
    </div>
  );
}