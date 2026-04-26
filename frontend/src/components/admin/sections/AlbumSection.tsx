import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { getResourceUrl } from "@/utils/urlHelper";
import { apiRequest } from "@/utils/apiClient"; // ✅ Dùng apiClient sếp vừa tạo

interface Props {
  searchQuery: string; // ✅ Nhận keyword từ Dashboard
  refresh: number;
  onEdit: (album: any) => void;
  onDelete: (id: number) => void;
}

const API_BASE = "/api";

export function AlbumSection({ searchQuery, refresh, onEdit, onDelete }: Props) {
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlbums = useCallback(async () => {
    try {
      setIsLoading(true);
      // ✅ Dùng apiRequest để tự động xử lý Token hết hạn
      const data = await apiRequest(`${API_BASE}/albums?size=100`);
      if (data) {
        setAlbums(data.content || (Array.isArray(data) ? data : []));
      }
    } catch (err) {
      console.error("Scriptify Admin: Error fetching albums", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [refresh, fetchAlbums]);

  // ✅ Logic tìm kiếm Client-side cực nhanh
  const filteredAlbums = useMemo(() => {
    return albums.filter((album) =>
      album.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.artist?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [albums, searchQuery]);

  return (
    <Card className="bg-zinc-950 border-white/5 overflow-hidden rounded-[2rem] shadow-2xl">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5 text-zinc-500 uppercase text-[10px] font-black tracking-[0.2em] h-14 italic">
            <TableHead className="w-24 text-center">Bìa Cloud</TableHead>
            <TableHead>Tên Album</TableHead>
            <TableHead>Nghệ Sĩ</TableHead>
            <TableHead className="text-center">Năm</TableHead>
            <TableHead className="text-right pr-10">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={5} className="text-center py-20 animate-pulse font-black text-zinc-600 italic">ĐANG TRUY XUẤT DỮ LIỆU...</TableCell></TableRow>
          ) : filteredAlbums.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-center py-20 text-zinc-700 font-black italic uppercase">Không tìm thấy kết quả phù hợp</TableCell></TableRow>
          ) : (
            filteredAlbums.map((album) => (
              <TableRow key={album.id} className="border-white/5 hover:bg-white/5 transition-all h-20 group">
                <TableCell className="text-center">
                  <img 
                    src={getResourceUrl(album.coverImageUrl)} 
                    className="w-12 h-12 inline-block object-cover rounded-lg border border-white/5 group-hover:scale-110 transition-all shadow-lg"
                    onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")}
                  />
                </TableCell>
                <TableCell className="font-black text-zinc-200 uppercase italic">
                  {album.title}
                </TableCell>
                <TableCell className="text-zinc-500 text-[11px] font-black uppercase italic">
                  {album.artist?.name}
                </TableCell>
                <TableCell className="text-center font-black text-zinc-600 text-xs">
                  {album.releaseYear}
                </TableCell>
                <TableCell className="text-right pr-10">
                  <div className="flex justify-end gap-2 transition-all">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(album)} className="text-blue-400 hover:bg-blue-400/10 rounded-xl h-9 w-9"><Pencil size={16}/></Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(album.id)} className="text-red-500 hover:bg-red-400/10 rounded-xl h-9 w-9"><Trash2 size={16}/></Button>
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