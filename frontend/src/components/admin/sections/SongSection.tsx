import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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
const ITEMS_PER_PAGE = 5;

export function SongSection({ searchQuery, refresh, onEdit, onDelete }: SongSectionProps) {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // --- FETCH DATA ---
  const fetchSongs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`${API_BASE}/songs?size=200`);
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

  // --- SEARCH & FILTER ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredSongs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return songs.filter((song) =>
      song.title?.toLowerCase().includes(query) ||
      song.artist?.name?.toLowerCase().includes(query) ||
      song.album?.title?.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);

  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredSongs.length / ITEMS_PER_PAGE);

  const paginatedSongs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSongs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSongs, currentPage]);

  // Tính toán số dòng bị thiếu
  const emptyRows = paginatedSongs.length > 0 ? ITEMS_PER_PAGE - paginatedSongs.length : 0;

  // --- UI RENDER ---
  return (
    <Card className="bg-card border-border overflow-hidden rounded-[2rem] shadow-lg transition-colors duration-300 flex flex-col h-full">
      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader className="bg-secondary/50 transition-colors duration-300">
            <TableRow className="border-border text-muted-foreground uppercase text-[10px] font-black tracking-[0.2em] h-14 italic hover:bg-transparent transition-colors duration-300">
              <TableHead className="w-[100px] text-center">Bìa</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Nghệ sĩ</TableHead>
              <TableHead>Album</TableHead>
              <TableHead className="text-right pr-10">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-border hover:bg-transparent transition-colors duration-300">
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-black uppercase text-[10px] tracking-widest animate-pulse italic">
                  Đang quét kho nhạc từ Scriptify Cloud...
                </TableCell>
              </TableRow>
            ) : filteredSongs.length === 0 ? (
              <TableRow className="border-border hover:bg-transparent transition-colors duration-300">
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground/70 font-black uppercase text-[10px] tracking-widest italic">
                  {searchQuery ? "Không tìm thấy bài hát nào khớp với từ khóa." : "Kho nhạc hiện tại đang trống rỗng."}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {/* Dòng dữ liệu thật */}
                {paginatedSongs.map((song) => (
                  <TableRow key={song.id} className="border-border hover:bg-accent transition-colors duration-300 h-20 group">
                    <TableCell className="text-center">
                      <img 
                        src={getResourceUrl(song.imageUrl)} 
                        className="w-12 h-12 inline-block object-cover border border-border rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-500"
                        alt={song.title}
                        onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")}
                      />
                    </TableCell>
                    <TableCell className="font-black text-foreground transition-colors duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="uppercase italic tracking-tight group-hover:text-primary transition-colors">
                          {song.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[11px] font-black uppercase italic tracking-wider transition-colors duration-300">
                      {song.artist?.name || "Nghệ sĩ ẩn danh"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[11px] font-black uppercase italic tracking-wider opacity-80 transition-colors duration-300">
                      {song.album?.title ? (
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{song.album.title}</span>
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
                          className="text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 h-9 w-9 rounded-xl transition-colors"
                        >
                          <Pencil size={16} className="stroke-[2.5px]"/>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDelete(song.id)} 
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive h-9 w-9 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} className="stroke-[2.5px]"/>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Dòng trống (Ghost Rows) ĐÃ ĐƯỢC FIX CỘT CHỐNG */}
                {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
                  <TableRow key={`empty-${index}`} className="border-transparent hover:bg-transparent pointer-events-none">
                    <TableCell colSpan={5} className="p-0">
                      <div className="h-20 w-full" aria-hidden="true"></div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-8 py-4 bg-secondary/30 border-t border-border mt-auto transition-colors duration-300">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic transition-colors">
            Trang {currentPage} / {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-lg border-border text-muted-foreground hover:text-foreground hover:bg-background transition-all disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 rounded-lg border-border text-muted-foreground hover:text-foreground hover:bg-background transition-all disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}