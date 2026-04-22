import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; 
import { useAuthStore } from "@/store/useAuthStore";

export function LoginForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Lấy hàm cập nhật từ Store
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    try {
      // BƯỚC 1: ĐĂNG NHẬP LẤY TOKEN
      const loginResponse = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        const token = loginData.token;
        // Lưu token vào store trước để có cái dùng gọi API tiếp theo
        setToken(token);

        // BƯỚC 2: GỌI API LẤY PROFILE NGƯỜI DÙNG
        // Tui giả định endpoint là /api/user/me, bồ check lại Backend nhé!
        try {
          const profileResponse = await fetch("http://localhost:8080/api/user/me", {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });

          if (profileResponse.ok) {
            const userData = await profileResponse.json();
            // Cập nhật User vào Store -> Sidebar sẽ tự đổi giao diện
            setUser(userData);
          }
        } catch (profileErr) {
          console.error("Không lấy được profile:", profileErr);
          // Nếu lỗi lấy profile thì vẫn cho vào Home nhưng Sidebar sẽ trống
        }

        toast.success("Đăng nhập thành công!", {
          description: "Mừng bồ quay trở lại với Scriptify.",
        });
        
        navigate("/"); 
      } else {
        // Xử lý lỗi đăng nhập
        if (loginData.message === "Account not verified!" || loginData.code === "ACCOUNT_NOT_VERIFIED") {
          toast.warning("Tài khoản chưa xác thực", {
            description: "Đang đưa bồ đến trang xác nhận mã OTP..."
          });
          navigate("/verify-otp", { state: { email: email } });
        } else {
          setError(loginData.message || "Email hoặc mật khẩu không chính xác");
        }
      }
    } catch (err) {
      setError("Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại hệ thống.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-white shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="space-y-2 text-center pt-10 px-10">
          <CardTitle className="text-4xl font-black italic tracking-tighter text-green-500 uppercase">
            Scriptify
          </CardTitle>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">Nền tảng âm nhạc trực tuyến</p>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-10">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400 font-bold text-[10px] uppercase tracking-wider">Địa chỉ Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={isLoading}
                placeholder="email@vidu.com"
                className="border-zinc-700 bg-zinc-800 text-white focus-visible:ring-green-500 rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-400 font-bold text-[10px] uppercase tracking-wider">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                placeholder="••••••••"
                className="border-zinc-700 bg-zinc-800 text-white focus-visible:ring-green-500 rounded-xl h-12"
              />
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-[11px] font-bold text-red-500 border border-red-500/20 animate-in fade-in slide-in-from-top-1 text-center uppercase italic">
                ⚠️ {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pb-12 px-10 pt-6">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-green-500 text-black hover:bg-green-400 font-black uppercase italic transition-all h-14 rounded-2xl shadow-lg shadow-green-500/10 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                "Đăng nhập ngay"
              )}
            </Button>
            <p className="text-zinc-500 text-center text-xs font-medium">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-green-500 hover:text-green-400 font-bold transition-colors">Đăng ký thành viên</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}