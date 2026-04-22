import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { getResourceUrl } from "@/utils/urlHelper";

interface Props {
  refresh: number;
  onEdit: (artist: any) => void;
  onDelete: (id: number) => void;
}

export function ArtistSection({ refresh, onEdit, onDelete }: Props) {
  const [artists, setArtists] = useState<any[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8080/api/artists/all", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setArtists(Array.isArray(data) ? data : data.content || []));
  }, [refresh, token]);

  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden rounded-2xl shadow-2xl">
      <Table>
        <TableHeader className="bg-zinc-800/50">
          <TableRow className="border-zinc-800 text-zinc-500 uppercase text-[10px] font-bold tracking-widest h-12">
            <TableHead className="w-[100px] text-center">Ảnh</TableHead>
            <TableHead>Tên Nghệ Sĩ</TableHead>
            <TableHead className="max-w-[300px]">Tiểu sử</TableHead>
            <TableHead className="text-right pr-8">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {artists.map((artist) => (
            <TableRow key={artist.id} className="border-zinc-800 hover:bg-zinc-800/40 transition-colors h-20">
              <TableCell className="text-center">
                <img 
                  src={getResourceUrl(artist.imageUrl)} 
                  className="w-12 h-12 inline-block object-cover border border-zinc-700 rounded-full"
                />
              </TableCell>
              <TableCell className="font-bold text-zinc-200">
                 <div className="flex items-center gap-2">
                  <Mic2 size={14} className="text-green-500" />
                  {artist.name}
                </div>
              </TableCell>
              <TableCell className="text-zinc-500 text-xs italic line-clamp-1 mt-6">
                {artist.bio || "Chưa có tiểu sử..."}
              </TableCell>
              <TableCell className="text-right pr-8">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(artist)} className="text-blue-400 hover:bg-blue-400/10 h-8 w-8"><Pencil size={14}/></Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(artist.id)} className="text-red-500 hover:bg-red-500/10 h-8 w-8"><Trash2 size={14}/></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}