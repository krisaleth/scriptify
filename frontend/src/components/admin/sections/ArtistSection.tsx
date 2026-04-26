import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { getResourceUrl } from "@/utils/urlHelper";
import { apiRequest } from "@/utils/apiClient"; // ✅ Sử dụng apiClient thông minh

interface Props {
  searchQuery: string; // ✅ Nhận từ khóa từ AdminDashboard truyền xuống
  refresh: number;
  onEdit: (artist: any) => void;
  onDelete: (id: number) => void;
}

const API_BASE = "/api";

export function ArtistSection({ searchQuery, refresh, onEdit, onDelete }: Props) {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch data qua người gác cổng apiRequest
  const fetchArtists = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`${API_BASE}/artists/all`);
      if (data) {
        // Xử lý cả 2 trường hợp: Backend trả về mảng hoặc Object phân trang
        setArtists(Array.isArray(data) ? data : data.content || []);
      }
    } catch (err) {
      console.error("Scriptify Admin: Lỗi truy xuất nghệ sĩ.", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArtists();
  }, [refresh, fetchArtists]);

  // ✅ Logic tìm kiếm tại chỗ (Client-side filtering) cực nhanh trên máy LOQ
  const filteredArtists = useMemo(() => {
    return artists.filter((artist) =>
      artist.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.bio?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [artists, searchQuery]);

  return (
    <Card className="bg-zinc-950 border-white/5 overflow-hidden rounded-[2rem] shadow-2xl">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5 text-zinc-500 uppercase text-[10px] font-black tracking-[0.2em] h-14 italic">
            <TableHead className="w-[100px] text-center">Ảnh</TableHead>
            <TableHead>Tên Nghệ Sĩ</TableHead>
            <TableHead className="max-w-[300px]">Tiểu sử Cloud</TableHead>
            <TableHead className="text-right pr-10">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow className="border-white/5">
              <TableCell colSpan={4} className="text-center py-20 text-zinc-600 font-black uppercase text-[10px] tracking-widest animate-pulse italic">
                Đang quét danh sách từ Scriptify Cloud...
              </TableCell>
            </TableRow>
          ) : filteredArtists.length === 0 ? (
            <TableRow className="border-white/5">
              <TableCell colSpan={4} className="text-center py-20 text-zinc-700 font-black uppercase text-[10px] tracking-widest italic">
                {searchQuery ? "Không tìm thấy nghệ sĩ nào khớp với từ khóa." : "Thư viện nghệ sĩ hiện đang trống."}
              </TableCell>
            </TableRow>
          ) : (
            filteredArtists.map((artist) => (
              <TableRow key={artist.id} className="border-white/5 hover:bg-white/5 transition-all h-20 group">
                <TableCell className="text-center">
                  <img 
                    src={getResourceUrl(artist.imageUrl)} 
                    className="w-12 h-12 inline-block object-cover border border-white/5 rounded-full shadow-xl group-hover:scale-110 transition-transform duration-500"
                    alt={artist.name}
                    onError={(e) => (e.currentTarget.src = "/assets/default-artist.png")}
                  />
                </TableCell>
                <TableCell className="font-black text-zinc-200">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="uppercase italic tracking-tighter group-hover:text-green-500 transition-colors">
                      {artist.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-500 text-[11px] font-black italic tracking-tight">
                  <div className="line-clamp-2 max-w-[400px] opacity-60 group-hover:opacity-100 transition-opacity">
                    {artist.bio || "Nghệ sĩ này hiện chưa cập nhật tiểu sử trên hệ thống..."}
                  </div>
                </TableCell>
                <TableCell className="text-right pr-10">
                  <div className="flex justify-end gap-3 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit(artist)} 
                      className="text-blue-400 hover:bg-blue-400/10 hover:text-blue-300 h-9 w-9 rounded-xl transition-all"
                    >
                      <Pencil size={16} className="stroke-[2.5px]"/>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(artist.id)} 
                      className="text-red-500 hover:bg-red-500/10 hover:text-red-400 h-9 w-9 rounded-xl transition-all"
                    >
                      <Trash2 size={16} className="stroke-[2.5px]"/>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}