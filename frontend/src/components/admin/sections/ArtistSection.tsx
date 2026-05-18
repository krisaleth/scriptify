import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { getResourceUrl } from "@/utils/urlHelper";
import { apiRequest } from "@/utils/apiClient"; 

interface Props {
  searchQuery: string; // Nhận keyword từ Dashboard
  refresh: number;
  onEdit: (artist: any) => void;
  onDelete: (id: number) => void;
}

const API_BASE = "/api";

export function ArtistSection({ searchQuery, refresh, onEdit, onDelete }: Props) {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data qua người gác cổng apiRequest
  const fetchArtists = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`${API_BASE}/artists`);
      if (data) {
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

  // Logic tìm kiếm tại chỗ (Client-side filtering) cực nhanh
  const filteredArtists = useMemo(() => {
    return artists.filter((artist) =>
      artist.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.bio?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [artists, searchQuery]);

  return (
    <Card className="bg-card border-border overflow-hidden rounded-[2rem] shadow-lg transition-colors duration-300">
      <Table>
        <TableHeader className="bg-secondary/50 transition-colors duration-300">
          <TableRow className="border-border text-muted-foreground uppercase text-[10px] font-black tracking-[0.2em] h-14 italic transition-colors duration-300 hover:bg-transparent">
            <TableHead className="w-[100px] text-center">Ảnh</TableHead>
            <TableHead>Tên Nghệ Sĩ</TableHead>
            <TableHead className="max-w-[300px]">Tiểu sử</TableHead>
            <TableHead className="text-right pr-10">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow className="border-border hover:bg-transparent transition-colors duration-300">
              <TableCell colSpan={4} className="text-center py-20 text-muted-foreground font-black uppercase text-[10px] tracking-widest animate-pulse italic">
                Đang quét danh sách từ Scriptify...
              </TableCell>
            </TableRow>
          ) : filteredArtists.length === 0 ? (
            <TableRow className="border-border hover:bg-transparent transition-colors duration-300">
              <TableCell colSpan={4} className="text-center py-20 text-muted-foreground/70 font-black uppercase text-[10px] tracking-widest italic">
                {searchQuery ? "Không tìm thấy nghệ sĩ nào khớp với từ khóa." : "Thư viện nghệ sĩ hiện đang trống."}
              </TableCell>
            </TableRow>
          ) : (
            filteredArtists.map((artist) => (
              <TableRow key={artist.id} className="border-border hover:bg-accent transition-colors duration-300 h-20 group">
                <TableCell className="text-center">
                  <img 
                    src={getResourceUrl(artist.imageUrl)} 
                    className="w-12 h-12 inline-block object-cover border border-border rounded-full shadow-sm group-hover:scale-110 transition-transform duration-500"
                    alt={artist.name}
                    onError={(e) => (e.currentTarget.src = "/assets/default-artist.png")}
                  />
                </TableCell>
                <TableCell className="font-black text-foreground transition-colors duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="uppercase italic tracking-tighter group-hover:text-primary transition-colors">
                      {artist.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-[11px] font-black italic tracking-tight transition-colors duration-300">
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
                      className="text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 h-9 w-9 rounded-xl transition-colors"
                    >
                      <Pencil size={16} className="stroke-[2.5px]"/>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(artist.id)} 
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-9 w-9 rounded-xl transition-colors"
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