import React, { useState, useMemo } from "react";
import { ShieldCheck, Plus, Music2, Mic2, Library, Users as UsersIcon, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Swal from 'sweetalert2';

import { SongSection } from "./sections/SongSection";
import { ArtistSection } from "./sections/ArtistSection";
import { AlbumSection } from "./sections/AlbumSection";
import { UserSection } from "./sections/UserSection";
import { EntityDialog } from "./sections/EntityDialog";
import { AdminSearchControl } from "./sections/AdminSearchControl";
import { apiRequest } from "@/utils/apiClient"; 

const API_BASE = "/api";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState("music");
  const [searchQuery, setSearchQuery] = useState(""); 
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  
  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  const searchPlaceholder = useMemo(() => {
    switch (mainTab) {
      case "music": return "Tìm tên bài hát...";
      case "artists": return "Tìm nghệ sĩ...";
      case "albums": return "Tìm tiêu đề album...";
      case "user": return "Tìm email/nickname...";
      default: return "Nhập nội dung cần tìm...";
    }
  }, [mainTab]);

  const handleDelete = async (path: string, id: number) => {
    const result = await Swal.fire({
      title: "Bạn chắc chắn chứ?",
      text: "Thao tác này sẽ xoá vĩnh viễn dữ liệu và không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      buttonsStyling: false,
      background: "transparent", // Ép Swal nhường quyền quản lý màu nền cho Tailwind
      customClass: {
        popup: 'bg-card border border-border text-foreground rounded-[2rem] shadow-2xl backdrop-blur-xl transition-colors duration-300',
        title: 'text-foreground font-black italic tracking-tighter text-2xl',
        htmlContainer: 'text-muted-foreground font-medium',
        actions: 'flex gap-4 w-full justify-center mt-6',
        confirmButton: 'bg-destructive text-destructive-foreground px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs italic hover:bg-destructive/90 transition-all shadow-lg m-0',
        cancelButton: 'bg-secondary text-foreground px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs italic hover:bg-secondary/80 transition-all border border-border m-0',
      },
      confirmButtonText: "Vâng, xoá nó!",
      cancelButtonText: "Huỷ bỏ",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE}/${path}/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          Swal.fire({
            title: "Đã xoá!",
            text: "Mục này đã bay màu khỏi hệ thống.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            buttonsStyling: false,
            background: "transparent",
            customClass: {
              popup: 'bg-card border border-border text-foreground rounded-[2rem] shadow-2xl backdrop-blur-xl transition-colors duration-300',
              title: 'text-foreground font-black italic tracking-tighter text-2xl',
              htmlContainer: 'text-muted-foreground font-medium',
            }
          });
          triggerRefresh();
        } else {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Lỗi khi xoá");
        }
      } catch (err: any) {
        toast.error(err.message || "Không thể xoá. Kiểm tra lại database sếp ơi!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 p-6 md:p-10 selection:bg-primary/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter flex items-center gap-3 text-primary transition-colors duration-300">
              <ShieldCheck className="w-10 h-10 drop-shadow-md" /> 
              ADMIN
            </h1>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em] italic mt-1 ml-14 transition-colors duration-300">
              Cloud Control
            </p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <AdminSearchControl 
              placeholder={searchPlaceholder} 
              onSearch={setSearchQuery} 
              tabValue={mainTab} 
            />

            {mainTab !== "user" && (
              <Button 
                onClick={() => { setEditItem(null); setDialogOpen(true); }}
                className="bg-primary text-primary-foreground font-black px-6 h-12 rounded-xl hover:scale-105 transition-all shadow-lg italic shrink-0"
              >
                <Plus className="mr-2 w-5 h-5 stroke-[3px]" /> THÊM
              </Button>
            )}

            {/* Đã thêm rounded-xl vào nút Home */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center w-12 h-12 bg-secondary border border-border text-muted-foreground rounded-xl hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all shadow-lg shrink-0 group"
              title="Trở về Trang Chủ"
            >
              <Home className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
          <TabsList className="bg-secondary/50 border border-border p-1.5 rounded-2xl h-14 w-full justify-start overflow-x-auto no-scrollbar sm:w-auto transition-colors duration-300">
            <TabsTrigger value="music" className="px-8 rounded-xl font-black uppercase italic text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">Nhạc</TabsTrigger>
            <TabsTrigger value="artists" className="px-8 rounded-xl font-black uppercase italic text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">Nghệ sĩ</TabsTrigger>
            <TabsTrigger value="albums" className="px-8 rounded-xl font-black uppercase italic text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">Albums</TabsTrigger>
            <TabsTrigger value="user" className="px-8 rounded-xl font-black uppercase italic text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">Users</TabsTrigger>
          </TabsList>

          <div className="bg-secondary/20 rounded-[2.5rem] border border-border p-8 min-h-[600px] backdrop-blur-md shadow-lg relative transition-colors duration-300">
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