import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; 
import { useAuthStore } from "@/store/useAuthStore"; // 1. Import store

export function LoginForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 2. Lấy hàm setToken từ Zustand
  const setToken = useAuthStore((state) => state.setToken);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Sử dụng hàm setToken thay vì chỉ dùng localStorage
        // Hàm setToken trong Store bồ viết đã bao gồm việc lưu localStorage rồi
        setToken(data.token);
        
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        // 4. Gọi thông báo TRƯỚC khi điều hướng
        toast.success("Mừng bồ quay trở lại Scriptify!", {
          description: "Đăng nhập thành công rồi nhé.",
        });

        // 5. Dùng navigate để chuyển trang mượt mà
        // Toast sẽ tiếp tục hiển thị trên trang chủ
        navigate("/"); 
      } else {
        if (data.code === "ACCOUNT_NOT_VERIFIED") {
          navigate("/verify-otp", { state: { email: email } });
        } else {
          setError(data.message || "Email hoặc mật khẩu không chính xác");
        }
      }
    } catch (err) {
      setError("Không thể kết nối tới máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4">
      {/* ... Phần JSX giữ nguyên ... */}
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-white shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-black italic tracking-tighter text-green-500">
            Scriptify
          </CardTitle>
          <p className="text-zinc-400 text-sm">Mừng bồ quay trở lại!</p>
          {error && (
            <p className="text-sm font-medium text-red-500 bg-red-500/10 p-2 rounded mt-2 border border-red-500/20">
              {error}
            </p>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                required
                placeholder="ten@vi-du.com"
                className="border-zinc-700 bg-zinc-800 text-white focus-visible:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Mật khẩu</Label>
              <Input
                id="login-password"
                name="password"
                type="password"
                required
                placeholder="Nhập mật khẩu của bồ"
                className="border-zinc-700 bg-zinc-800 text-white focus-visible:ring-green-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-green-500 text-black hover:bg-green-400 font-bold h-11 rounded-full transition-all"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Đăng Nhập"
              )}
            </Button>
            <p className="text-zinc-400 text-center text-sm">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-green-400 font-medium hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}