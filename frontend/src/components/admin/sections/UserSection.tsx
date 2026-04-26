import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Trash2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { getResourceUrl } from "@/utils/urlHelper";
import { apiRequest } from "@/utils/apiClient"; // ✅ Sử dụng người gác cổng thông minh

interface Props {
  searchQuery: string; // ✅ Nhận từ khóa từ Dashboard
  refresh: number;
  onDelete: (id: number) => void;
}

const API_BASE = "/api";

export function UserSection({ searchQuery, refresh, onDelete }: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch data dùng apiRequest để tự động xử lý khi Token hỏng/hết hạn
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`${API_BASE}/user/all`);
      if (data) {
        // Xử lý linh hoạt cho cả Page object (.content) hoặc mảng thuần
        setUsers(data.content || (Array.isArray(data) ? data : []));
      }
    } catch (err) {
      console.error("Scriptify Admin: Lỗi truy xuất danh sách người dùng.", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [refresh, fetchUsers]);

  // ✅ Logic tìm kiếm Client-side: Lọc theo Nickname hoặc Email
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return users.filter((u) =>
      u.email?.toLowerCase().includes(query) ||
      u.nickname?.toLowerCase().includes(query) ||
      u.username?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

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
          ) : filteredUsers.length === 0 ? (
            <TableRow className="border-white/5">
              <TableCell colSpan={5} className="text-center py-20 text-zinc-700 font-black uppercase text-[10px] tracking-widest italic">
                {searchQuery ? "Không tìm thấy cư dân nào khớp với từ khóa." : "Chưa có cư dân nào trong hệ thống."}
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((userItem) => (
              <TableRow key={userItem.id} className="border-white/5 hover:bg-white/5 transition-all h-20 group">
                <TableCell className="text-center">
                  <img 
                    src={getResourceUrl(userItem.avatarUrl)} 
                    className="w-10 h-10 inline-block object-cover rounded-full border border-white/5 shadow-xl transition-transform group-hover:scale-110 duration-500"
                    alt="Avatar"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/default-avatar.png";
                    }}
                  />
                </TableCell>
                <TableCell className="font-black text-zinc-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${userItem.role === 'ADMIN' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-green-500'}`}></div>
                    <span className={`uppercase italic tracking-tighter transition-colors ${userItem.role === 'ADMIN' ? 'group-hover:text-red-400' : 'group-hover:text-green-500'}`}>
                      {userItem.nickname || userItem.username || "Unknown"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-500 text-[11px] font-black italic tracking-wide">
                  {userItem.email}
                </TableCell>
                <TableCell className="text-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                    userItem.role === 'ADMIN' 
                      ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                      : 'bg-zinc-900 text-zinc-500 border-white/5'
                  }`}>
                    {userItem.role === 'ADMIN' && <ShieldAlert size={10} className="inline mr-1 mb-0.5" />}
                    {userItem.role}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-10">
                  <div className="flex justify-end transition-all transform translate-x-4 group-hover:translate-x-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(userItem.id)} 
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