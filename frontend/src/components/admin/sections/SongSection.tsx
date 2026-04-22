import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { getResourceUrl } from "@/utils/urlHelper";

interface SongSectionProps {
  refresh: number;
  onEdit: (song: any) => void;
  onDelete: (id: number) => void;
}

export function SongSection({ refresh, onEdit, onDelete }: SongSectionProps) {
  const [songs, setSongs] = useState<any[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/songs?size=100", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setSongs(data.content || []);
      } catch (err) {
        console.error("Lỗi fetch nhạc:", err);
      }
    };
    fetchSongs();
  }, [refresh, token]);

  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden rounded-2xl shadow-2xl">
      <Table>
        <TableHeader className="bg-zinc-800/50">
          <TableRow className="border-zinc-800 text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
            <TableHead className="w-[80px] text-center">Bìa</TableHead>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Nghệ sĩ</TableHead>
            <TableHead>Album</TableHead>
            <TableHead className="text-right pr-8">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {songs.map((song) => (
            <TableRow key={song.id} className="border-zinc-800 hover:bg-zinc-800/40 transition-colors group h-20">
              <TableCell className="text-center">
                <img 
                  src={getResourceUrl(song.imageUrl)} 
                  className="w-12 h-12 inline-block object-cover border border-zinc-700 rounded-md shadow-md"
                  onError={(e) => (e.currentTarget.src = "/default-cover.png")}
                />
              </TableCell>
              <TableCell className="font-bold text-zinc-200">
                <div className="flex items-center gap-2">
                  <Music2 size={14} className="text-green-500" />
                  {song.title}
                </div>
              </TableCell>
              <TableCell className="text-zinc-400 text-xs italic">
                {song.artist?.name || "Unknown Artist"}
              </TableCell>
              <TableCell className="text-zinc-500 text-xs italic">
                {song.album?.title || "Single"}
              </TableCell>
              <TableCell className="text-right pr-8">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(song)} 
                    className="text-blue-400 hover:bg-blue-400/10 h-8 w-8"
                  >
                    <Pencil size={14}/>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(song.id)} 
                    className="text-red-500 hover:bg-red-500/10 h-8 w-8"
                  >
                    <Trash2 size={14}/>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}