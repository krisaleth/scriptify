import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { getResourceUrl } from "@/utils/urlHelper";
import { apiRequest } from "@/utils/apiClient";

interface SongSectionProps {
  searchQuery: string;
  refresh: number;
  onEdit: (song: any) => void;
  onDelete: (id: number) => void;
}

const API_BASE = "/api";

export function SongSection({ searchQuery, refresh, onEdit, onDelete }: SongSectionProps) {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`${API_BASE}/songs?size=200`); // Lấy nhiều để search cho đã sếp ơi
      if (data) {
        setSongs(data.content || (Array.isArray(data) ? data : []));
      }
    } catch (err) {
      console.error("Scriptify Admin: Lỗi truy xuất kho nhạc.", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [refresh, fetchSongs]);

  // ✅ Logic tìm kiếm đa năng: Tên bài, Nghệ sĩ hoặc Album
  const filteredSongs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return songs.filter((song) =>
      song.title?.toLowerCase().includes(query) ||
      song.artist?.name?.toLowerCase().includes(query) ||
      song.album?.title?.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);

  return (
    <Card className="bg-zinc-950 border-white/5 overflow-hidden rounded-[2rem] shadow-2xl">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5 text-zinc-500 uppercase text-[10px] font-black tracking-[0.2em] h-14 italic">
            <TableHead className="w-[100px] text-center">Bìa</TableHead>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Nghệ sĩ</TableHead>
            <TableHead>Album</TableHead>
            <TableHead className="text-right pr-10">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow className="border-white/5">
              <TableCell colSpan={5} className="text-center py-20 text-zinc-600 font-black uppercase text-[10px] tracking-widest animate-pulse italic">
                Đang quét kho nhạc từ Scriptify Cloud...
              </TableCell>
            </TableRow>
          ) : filteredSongs.length === 0 ? (
            <TableRow className="border-white/5">
              <TableCell colSpan={5} className="text-center py-20 text-zinc-700 font-black uppercase text-[10px] tracking-widest italic">
                {searchQuery ? "Không tìm thấy bài hát nào khớp với từ khóa." : "Kho nhạc hiện tại đang trống rỗng."}
              </TableCell>
            </TableRow>
          ) : (
            filteredSongs.map((song) => (
              <TableRow key={song.id} className="border-white/5 hover:bg-white/5 transition-all h-20 group">
                <TableCell className="text-center">
                  <img 
                    src={getResourceUrl(song.imageUrl)} 
                    className="w-12 h-12 inline-block object-cover border border-white/5 rounded-lg shadow-xl group-hover:scale-110 transition-transform duration-500"
                    alt={song.title}
                    onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")}
                  />
                </TableCell>
                <TableCell className="font-black text-zinc-200">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="uppercase italic tracking-tight group-hover:text-green-500 transition-colors">
                      {song.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-500 text-[11px] font-black uppercase italic tracking-wider">
                  {song.artist?.name || "Nghệ sĩ ẩn danh"}
                </TableCell>
                <TableCell className="text-zinc-500 text-[11px] font-black uppercase italic tracking-wider opacity-60">
                  {song.album?.title ? (
                    <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">{song.album.title}</span>
                  ) : (
                    "Single"
                  )}
                </TableCell>
                <TableCell className="text-right pr-10">
                  <div className="flex justify-end gap-3 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit(song)} 
                      className="text-blue-400 hover:bg-blue-400/10 hover:text-blue-300 h-9 w-9 rounded-xl transition-all"
                    >
                      <Pencil size={16} className="stroke-[2.5px]"/>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(song.id)} 
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