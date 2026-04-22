import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; 

export function RegisterForm() {
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirm_password")?.toString();
    const email = formData.get("email")?.toString();

    if (password !== confirmPassword) {
      const msg = "Mật khẩu xác nhận không khớp bồ ơi!";
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (response.ok) {
        toast.success("Đăng ký thành công! Kiểm tra mail nhận mã nhé.");
        setTimeout(() => {
          navigate("/verify-otp", { state: { email: email }, replace: true });
        }, 1500);
      } else {
        const serverError = data?.message || "Đăng ký thất bại rồi!";
        setError(serverError);
        toast.error(serverError);
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-white shadow-2xl rounded-2xl">
        <CardHeader className="space-y-1 pt-8">
          <CardTitle className="text-3xl font-black italic tracking-tighter text-green-500 uppercase">
            Đăng ký Scriptify
          </CardTitle>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Khởi đầu hành trình âm nhạc của bồ</p>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 px-8">
            {/* Nickname */}
            <div className="space-y-2">
              <Label className="text-zinc-400 font-bold text-[10px] uppercase">Nickname</Label>
              <Input
                name="nickname"
                placeholder="Scriptify"
                className="border-zinc-700 bg-zinc-800 h-11 focus-visible:ring-green-500"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-zinc-400 font-bold text-[10px] uppercase">Email xác thực</Label>
              <Input
                name="email"
                type="email"
                required
                placeholder="ten@vi-du.com"
                className="border-zinc-700 bg-zinc-800 h-11 focus-visible:ring-green-500"
              />
            </div>

            {/* Avatar - Bỏ (Cloud R2) */}
            <div className="space-y-2">
              <Label className="text-zinc-400 font-bold text-[10px] uppercase">Ảnh đại diện</Label>
              <Input
                name="avatarFile"
                type="file"
                accept="image/*"
                onChange={onAvatarChange}
                className="cursor-pointer border-zinc-700 bg-zinc-800 file:bg-zinc-700 file:text-white"
              />
              {avatarPreview && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-800 bg-black/30 p-2 animate-in fade-in slide-in-from-left-2">
                  <img src={avatarPreview} className="h-10 w-10 rounded-full object-cover" />
                  <p className="text-[10px] text-zinc-500 italic">Avatar trông ổn đấy sếp!</p>
                </div>
              )}
            </div>

            {/* Password Row - Sửa chữ "Xác nhận mật khẩu" */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400 font-bold text-[10px] uppercase tracking-tighter">Mật khẩu</Label>
                <Input
                  name="password"
                  type="password"
                  required
                  className="border-zinc-700 bg-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 font-bold text-[10px] uppercase tracking-tighter">Xác nhận mật khẩu</Label>
                <Input
                  name="confirm_password"
                  type="password"
                  required
                  className="border-zinc-700 bg-zinc-800"
                />
              </div>
            </div>

            {error && (
              <div className="mt-2 text-[10px] font-bold text-red-500 uppercase italic">
                ⚠️ {error}
              </div>
            )}
          </CardContent>

          {/* Giãn khoảng cách từ phần mật khẩu xuống nút bằng cách dùng pt-10 và pb-10 */}
          <CardFooter className="flex flex-col gap-4 pb-10 px-8 pt-10">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-green-500 text-black hover:bg-green-400 font-black uppercase italic h-14 rounded-2xl shadow-xl shadow-green-500/10 active:scale-95 transition-transform"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Bắt đầu ngay"}
            </Button>
            <p className="text-zinc-500 text-center text-xs">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-green-500 hover:underline font-bold">Đăng nhập</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}