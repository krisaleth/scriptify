import React, { useEffect, useState, useCallback } from "react";
import { Pencil, Trash2, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { getResourceUrl } from "@/utils/urlHelper";

interface Props {
  refresh: number;
  onEdit: (album: any) => void;
  onDelete: (id: number) => void;
}

// ✅ Dùng đường dẫn tương đối để Nginx/Vite Proxy tự lo phần TLS
const API_BASE = "/api";

export function AlbumSection({ refresh, onEdit, onDelete }: Props) {
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlbums = useCallback(async () => {
    try {
      setIsLoading(true);
      // Gọi qua Proxy để đồng bộ Cookie và né lỗi SSL
      const response = await fetch(`${API_BASE}/albums?size=100`, {
        method: "GET",
        credentials: "include", // Cực kỳ quan trọng để gửi kèm JWT HttpOnly Cookie
      });

      if (response.ok) {
        const data = await response.json();
        // Spring Boot PageImpl trả về .content, nếu không có thì lấy data (mảng)
        setAlbums(data.content || (Array.isArray(data) ? data : []));
      } else {
        console.error("Scriptify Admin: Lỗi xác thực hoặc quyền hạn");
      }
    } catch (err) {
      console.error("Scriptify Admin: Lỗi kết nối Proxy nội bộ:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [refresh, fetchAlbums]);

  return (
    <Card className="bg-zinc-950 border-white/5 overflow-hidden rounded-[2rem] shadow-2xl">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5 text-zinc-500 uppercase text-[10px] font-black tracking-[0.2em] h-14 italic">
            <TableHead className="w-24 text-center">Bìa Cloud</TableHead>
            <TableHead>Tên Album</TableHead>
            <TableHead>Nghệ Sĩ</TableHead>
            <TableHead className="text-center">Năm Phát Hành</TableHead>
            <TableHead className="text-right pr-10">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow className="border-white/5">
              <TableCell colSpan={5} className="text-center py-20 text-zinc-600 font-black uppercase text-[10px] tracking-widest animate-pulse italic">
                Đang truy xuất dữ liệu từ Scriptify Cloud...
              </TableCell>
            </TableRow>
          ) : albums.length === 0 ? (
            <TableRow className="border-white/5">
              <TableCell colSpan={5} className="text-center py-20 text-zinc-700 font-black uppercase text-[10px] tracking-widest italic">
                Hiện chưa có Album nào trong thư viện.
              </TableCell>
            </TableRow>
          ) : (
            albums.map((album) => (
              <TableRow key={album.id} className="border-white/5 hover:bg-white/5 transition-all h-20 group">
                <TableCell className="text-center">
                  <img 
                    src={getResourceUrl(album.coverImageUrl)} 
                    className="w-12 h-12 inline-block object-cover rounded-lg shadow-lg border border-white/5 group-hover:scale-110 transition-transform duration-500"
                    alt={album.title}
                    onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")}
                  />
                </TableCell>
                <TableCell className="font-black text-zinc-200">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="uppercase italic tracking-tight group-hover:text-green-500 transition-colors">
                      {album.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-500 text-[11px] font-black uppercase italic tracking-wider">
                  {album.artist?.name || "Nghệ sĩ ẩn danh"}
                </TableCell>
                <TableCell className="text-center">
                   <span className="bg-black/40 text-zinc-500 px-3 py-1 rounded-full text-[10px] font-black border border-white/5">
                    {album.releaseYear || "2026"}
                   </span>
                </TableCell>
                <TableCell className="text-right pr-10">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit(album)} 
                      className="text-blue-400 hover:bg-blue-400/10 hover:text-blue-300 h-9 w-9 rounded-xl transition-all"
                    >
                      <Pencil size={16} className="stroke-[2.5px]"/>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(album.id)} 
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