import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; 
import { useAuthStore } from "@/store/useAuthStore";

// Route qua Proxy Nginx nội bộ
const API_BASE = "/api";

export function LoginForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Lấy hàm setUser để nạp data vào Zustand Persist (LocalStorage)
  const setUser = useAuthStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    try {
      // BƯỚC 1: GỬI REQUEST ĐĂNG NHẬP
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // BẮT BUỘC: Để nhận HttpOnly Cookie JWT từ Backend
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        // BƯỚC 2: NẠP USER TỪ RESPONSE VÀO STORE
        // Dựa trên tab Network của bạn, loginData đã có object { user: { ... } }
        if (loginData.user) {
          setUser(loginData.user); 

          toast.success("Mừng bạn quay lại!", {
            description: `Chào sếp ${loginData.user.nickname || 'Unnamed'}!`,
          });
          navigate("/"); 
        } else {
          console.error("Scriptify: Login thành công nhưng response thiếu object 'user'");
          setError("Dữ liệu phản hồi từ Cloud bị thiếu.");
        }
      } else {
        // Xử lý lỗi xác thực OTP hoặc sai pass
        if (loginData.message === "Account not verified!" || loginData.code === "ACCOUNT_NOT_VERIFIED") {
          toast.warning("Tài khoản chưa xác thực", {
            description: "Đang chuyển bạn đến hệ thống xác nhận OTP..."
          });
          navigate("/verify-otp", { state: { email: email } });
        } else {
          setError(loginData.message || "Email hoặc mật khẩu không đúng bạn ơi");
        }
      }
    } catch (err) {
      setError("Hệ thống Cloud đang bảo trì hoặc sai cấu hình Proxy.");
      console.error("Scriptify Login Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Thay bg-black thành bg-background
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 transition-colors duration-300">
      {/* Đổi bg-zinc-950, text-white, border-green... thành màu Theme */}
      <Card className="w-full max-w-md border-border bg-card text-card-foreground shadow-2xl shadow-primary/10 rounded-[2.5rem] overflow-hidden border-t-primary/50 border-t-8 transition-colors duration-300">
        <CardHeader className="space-y-2 text-center pt-12 px-10">
          <CardTitle className="text-5xl font-black italic tracking-tighter text-primary uppercase leading-none transition-colors">
            Scriptify
          </CardTitle>
          <p className="text-muted-foreground text-[9px] font-black uppercase tracking-[0.4em] italic opacity-80">Iconic Sound System</p>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 px-10 pt-4">
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest italic ml-1 group-focus-within:text-primary transition-colors">Địa chỉ Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={isLoading}
                placeholder="email@scriptify.com"
                className="border-border bg-secondary/50 text-foreground focus-visible:ring-primary/50 rounded-2xl h-14 transition-all italic placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="password" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest italic ml-1 group-focus-within:text-primary transition-colors">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                placeholder="••••••••"
                className="border-border bg-secondary/50 text-foreground focus-visible:ring-primary/50 rounded-2xl h-14 transition-all italic placeholder:text-muted-foreground/50"
              />
            </div>

            {error && (
              // Đổi đỏ cứng thành biến destructive
              <div className="mt-4 rounded-2xl bg-destructive/10 p-4 text-[10px] font-black text-destructive border border-destructive/20 animate-in fade-in slide-in-from-top-1 text-center uppercase italic tracking-widest transition-colors">
                ⚠ {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-6 pb-12 px-10 pt-8">
            <Button 
              type="submit" 
              disabled={isLoading}
              // Đổi nút xanh thành nút Primary của Theme
              className="w-full bg-primary text-primary-foreground font-black uppercase italic transition-all h-16 rounded-[1.5rem] shadow-2xl shadow-primary/20 active:scale-95 text-lg tracking-tighter hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : (
                "Đăng nhập ngay"
              )}
            </Button>
            <p className="text-muted-foreground text-center text-[10px] font-black uppercase tracking-widest italic">
              Chưa có tài khoản?{" "}
              {/* Link cũng đổi màu tương ứng */}
              <Link to="/register" className="text-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-border">Tham gia Scriptify</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}