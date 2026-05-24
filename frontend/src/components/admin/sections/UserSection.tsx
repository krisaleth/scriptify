import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Trash2, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { getResourceUrl } from "@/utils/urlHelper";
import { apiRequest } from "@/utils/apiClient";

interface Props {
  searchQuery: string; 
  refresh: number;
  onDelete: (id: number) => void;
}

const API_BASE = "/api";
const ITEMS_PER_PAGE = 5; 

export function UserSection({ searchQuery, refresh, onDelete }: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); 

  // Fetch data dùng apiRequest để tự động xử lý khi Token hỏng/hết hạn
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

  // Tự động reset về trang 1 khi gõ tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Logic tìm kiếm Client-side: Lọc theo Nickname hoặc Email
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return users.filter((u) =>
      u.email?.toLowerCase().includes(query) ||
      u.nickname?.toLowerCase().includes(query) ||
      u.username?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Logic Phân trang (Pagination)
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  // Tính toán số dòng trống để chèn "cột chống"
  const emptyRows = paginatedUsers.length > 0 ? ITEMS_PER_PAGE - paginatedUsers.length : 0;

  return (
    <Card className="bg-card border-border overflow-hidden rounded-[2rem] shadow-lg transition-colors duration-300 flex flex-col h-full">
      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader className="bg-secondary/50 transition-colors duration-300">
            <TableRow className="border-border text-muted-foreground uppercase text-[10px] font-black tracking-[0.2em] h-14 italic hover:bg-transparent transition-colors duration-300">
              <TableHead className="w-[100px] text-center">Cloud Identity</TableHead>
              <TableHead>Danh tính</TableHead>
              <TableHead>Địa chỉ Email</TableHead>
              <TableHead className="text-center">Quyền hạn</TableHead>
              <TableHead className="text-right pr-10">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-border hover:bg-transparent transition-colors duration-300">
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-black uppercase text-[10px] tracking-widest animate-pulse italic">
                  Đang quét danh bạ Scriptify Cloud...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow className="border-border hover:bg-transparent transition-colors duration-300">
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground/70 font-black uppercase text-[10px] tracking-widest italic">
                  {searchQuery ? "Không tìm thấy cư dân nào khớp với từ khóa." : "Chưa có cư dân nào trong hệ thống."}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {/* Dữ liệu thật */}
                {paginatedUsers.map((userItem) => (
                  <TableRow key={userItem.id} className="border-border hover:bg-accent transition-colors duration-300 h-20 group">
                    <TableCell className="text-center">
                      <img 
                        src={getResourceUrl(userItem.avatarUrl)} 
                        className="w-10 h-10 inline-block object-cover rounded-full border border-border shadow-sm transition-transform group-hover:scale-110 duration-500"
                        alt="Avatar"
                        onError={(e) => {
                          e.currentTarget.src = "/assets/default-avatar.png";
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-black text-foreground transition-colors duration-300">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${userItem.role === 'ADMIN' ? 'bg-destructive shadow-[0_0_10px_rgba(var(--destructive),0.5)]' : 'bg-primary'}`}></div>
                        <span className={`uppercase italic tracking-tighter transition-colors ${userItem.role === 'ADMIN' ? 'group-hover:text-destructive' : 'group-hover:text-primary'}`}>
                          {userItem.nickname || userItem.username || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[11px] font-black italic tracking-wide transition-colors duration-300">
                      {userItem.email}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border transition-colors duration-300 ${
                        userItem.role === 'ADMIN' 
                          ? 'bg-destructive/10 text-destructive border-destructive/20' 
                          : 'bg-secondary text-muted-foreground border-border'
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
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive h-9 w-9 rounded-xl transition-colors active:scale-90"
                          title="Xóa người dùng"
                        >
                          <Trash2 size={16} className="stroke-[2.5px]"/>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Dòng ma (Ghost Rows) để lấp đầy bảng */}
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