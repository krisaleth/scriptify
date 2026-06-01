import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { getResourceUrl } from "@/utils/urlHelper";
import { apiRequest } from "@/utils/apiClient";

interface Props {
  searchQuery: string; 
  refresh: number;
  onEdit: (album: any) => void;
  onDelete: (id: number) => void;
}

const API_BASE = "/api";
const ITEMS_PER_PAGE = 5;

export function AlbumSection({ searchQuery, refresh, onEdit, onDelete }: Props) {
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAlbums = useCallback(async () => {
    try {
      setIsLoading(true);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredAlbums = useMemo(() => {
    return albums.filter((album) =>
      album.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.artist?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [albums, searchQuery]);

  const totalPages = Math.ceil(filteredAlbums.length / ITEMS_PER_PAGE);

  const paginatedAlbums = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAlbums.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAlbums, currentPage]);

  // Tính toán số dòng trống để chèn "cột chống"
  const emptyRows = paginatedAlbums.length > 0 ? ITEMS_PER_PAGE - paginatedAlbums.length : 0;

  return (
    <Card className="bg-card border-border overflow-hidden rounded-[2rem] shadow-lg transition-colors duration-300 flex flex-col h-full">
      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader className="bg-secondary/50 transition-colors duration-300">
            <TableRow className="border-border text-muted-foreground uppercase text-[10px] font-black tracking-[0.2em] h-14 italic transition-colors duration-300 hover:bg-transparent">
              <TableHead className="w-24 text-center">Bìa Cloud</TableHead>
              <TableHead>Tên Album</TableHead>
              <TableHead>Nghệ Sĩ</TableHead>
              <TableHead className="text-center">Năm</TableHead>
              <TableHead className="text-right pr-10">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-border hover:bg-transparent transition-colors duration-300">
                <TableCell colSpan={5} className="text-center py-20 animate-pulse font-black text-muted-foreground italic">
                  ĐANG TRUY XUẤT DỮ LIỆU...
                </TableCell>
              </TableRow>
            ) : filteredAlbums.length === 0 ? (
              <TableRow className="border-border hover:bg-transparent transition-colors duration-300">
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground/70 font-black italic uppercase">
                  Không tìm thấy kết quả phù hợp
                </TableCell>
              </TableRow>
            ) : (
              <>
                {/* Render dữ liệu thực */}
                {paginatedAlbums.map((album) => (
                  <TableRow key={album.id} className="border-border hover:bg-accent transition-colors duration-300 h-20 group">
                    <TableCell className="text-center">
                      <img 
                        src={getResourceUrl(album.coverImageUrl)} 
                        className="w-12 h-12 inline-block object-cover rounded-lg border border-border group-hover:scale-110 transition-transform shadow-sm"
                        alt={album.title}
                        onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")}
                      />
                    </TableCell>
                    <TableCell className="font-black text-foreground uppercase italic transition-colors duration-300">
                      {album.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[11px] font-black uppercase italic transition-colors duration-300">
                      {album.artist?.name}
                    </TableCell>
                    <TableCell className="text-center font-black text-muted-foreground text-xs transition-colors duration-300">
                      {album.releaseYear}
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex justify-end gap-2 transition-all">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(album)} className="text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 rounded-xl h-9 w-9 transition-colors">
                          <Pencil size={16}/>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(album.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl h-9 w-9 transition-colors">
                          <Trash2 size={16}/>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Render các dòng ma (Ghost Rows) để lấp đầy bảng */}
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