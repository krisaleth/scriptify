import React, { useEffect, useState, useCallback } from "react";
import { Trash2, Users as UsersIcon, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { getResourceUrl } from "@/utils/urlHelper";

interface Props {
  refresh: number;
  onDelete: (id: number) => void;
}

// ✅ Dùng đường dẫn tương đối để Nginx Proxy tự lo TLS nội bộ
const API_BASE = "/api";

export function UserSection({ refresh, onDelete }: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Gọi qua Proxy để đảm bảo HttpOnly Cookie (JWT) được gửi kèm tới Backend
      const response = await fetch(`${API_BASE}/user/all`, {
        method: "GET",
        credentials: "include", 
      });

      if (response.ok) {
        const data = await response.json();
        // Xử lý linh hoạt cho cả Page object (.content) hoặc mảng thuần
        setUsers(data.content || (Array.isArray(data) ? data : []));
      } else {
        console.error("Scriptify Admin: Lỗi phân quyền hoặc phiên đăng nhập");
      }
    } catch (err) {
      console.error("Scriptify Admin: Lỗi kết nối Proxy (Users):", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [refresh, fetchUsers]);

  return (
    <Card className="bg-zinc-950 border-white/5 overflow-hidden rounded-[2rem] shadow-2xl">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5 text-zinc-500 uppercase text-[10px] font-black tracking-[0.2em] h-14 italic">
            <TableHead className="w-[100px] text-center">Cloud Identity</TableHead>
            <TableHead>Danh tính</TableHead>
            <TableHead>Địa chỉ Email</TableHead>
            <TableHead className="text-center">Quyền hạn</TableHead>
            <TableHead className="text-right pr-10">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow className="border-white/5">
              <TableCell colSpan={5} className="text-center py-20 text-zinc-600 font-black uppercase text-[10px] tracking-widest animate-pulse italic">
                Đang quét danh bạ Scriptify Cloud...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow className="border-white/5">
              <TableCell colSpan={5} className="text-center py-20 text-zinc-700 font-black uppercase text-[10px] tracking-widest italic">
                Chưa có cư dân nào trong hệ thống.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-all h-20 group">
                <TableCell className="text-center">
                  <img 
                    src={getResourceUrl(user.avatarUrl)} 
                    className="w-10 h-10 inline-block object-cover rounded-full border border-white/5 shadow-xl transition-transform group-hover:scale-110 duration-500"
                    alt="Avatar"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/default-avatar.png";
                    }}
                  />
                </TableCell>
                <TableCell className="font-black text-zinc-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${user.role === 'ADMIN' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className="uppercase italic tracking-tighter group-hover:text-white transition-colors">
                      {user.nickname || user.username}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-500 text-[11px] font-black italic tracking-wide">
                  {user.email}
                </TableCell>
                <TableCell className="text-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                    user.role === 'ADMIN' 
                      ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                      : 'bg-zinc-900 text-zinc-500 border-white/5'
                  }`}>
                    {user.role === 'ADMIN' && <ShieldAlert size={10} className="inline mr-1 mb-0.5" />}
                    {user.role}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-10">
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(user.id)} 
                      className="text-red-500 hover:bg-red-500/10 hover:text-red-400 h-9 w-9 rounded-xl transition-all active:scale-90"
                      title="Xóa người dùng"
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