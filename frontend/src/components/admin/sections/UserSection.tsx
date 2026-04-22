import React, { useEffect, useState } from "react";
import { Trash2, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { getResourceUrl } from "@/utils/urlHelper";

interface Props {
  refresh: number;
  onDelete: (id: number) => void;
}

export function UserSection({ refresh, onDelete }: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8080/api/user/all", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setUsers(data.content || []));
  }, [refresh, token]);

  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden rounded-2xl shadow-2xl">
      <Table>
        <TableHeader className="bg-zinc-800/50">
          <TableRow className="border-zinc-800 text-zinc-500 uppercase text-[10px] font-bold tracking-widest h-12">
            <TableHead className="w-[100px] text-center">Avatar</TableHead>
            <TableHead>Nickname</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Role</TableHead>
            <TableHead className="text-right pr-8">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-800/40 transition-colors h-20">
              <TableCell className="text-center">
                <img 
                  src={getResourceUrl(user.avatarUrl)} 
                  className="w-10 h-10 inline-block object-cover rounded-full border border-zinc-700"
                />
              </TableCell>
              <TableCell className="font-bold text-zinc-200">
                <div className="flex items-center gap-2">
                  <UsersIcon size={14} className="text-green-500" />
                  {user.nickname}
                </div>
              </TableCell>
              <TableCell className="text-zinc-400 text-xs italic">{user.email}</TableCell>
              <TableCell className="text-center">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${user.role === 'ADMIN' ? 'bg-red-500/20 text-red-500' : 'bg-zinc-700 text-zinc-300'}`}>{user.role}</span>
              </TableCell>
              <TableCell className="text-right pr-8">
                <Button variant="ghost" size="icon" onClick={() => onDelete(user.id)} className="text-red-500 hover:bg-red-500/10 h-8 w-8"><Trash2 size={14}/></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}