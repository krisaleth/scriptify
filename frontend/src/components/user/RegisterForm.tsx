import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Camera, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

// ✅ Dùng đường dẫn tương đối để đi qua Proxy nội bộ Docker/Vite
const API_BASE = "/api";

export function RegisterForm() {
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dọn dẹp bộ nhớ khi component unmount
  React.useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirm_password")?.toString();
    const email = formData.get("email")?.toString();

    // 1. Client-side Validation
    if (password !== confirmPassword) {
      const msg = "Mật khẩu xác nhận không khớp bạn ơi!";
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);

    try {
      // 2. Gọi API Đăng ký qua Proxy
      // KHÔNG set Content-Type header để trình duyệt tự điền boundary cho FormData (Multi-part)
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (response.ok) {
        toast.success("Đăng ký thành công!", { 
          description: "Check hòm thư nhận mã OTP để kích hoạt tài khoản nhé sếp." 
        });
        
        setTimeout(() => {
          // Replace: true để user không back lại trang đăng ký khi đã xong
          navigate("/verify-otp", { state: { email: email }, replace: true });
        }, 1500);
      } else {
        const serverError = data?.message || "Đăng ký thất bại, email này có thể đã tồn tại.";
        setError(serverError);
        toast.error(serverError);
      }
    } catch (err) {
      setError("Không thể kết nối tới Proxy xác thực.");
      toast.error("Lỗi kết nối Backend");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-white/5 bg-zinc-950 text-white shadow-[0_20px_50px_rgba(34,197,94,0.1)] rounded-[2.5rem] overflow-hidden border-t-green-500/20 border-t-8">
        <CardHeader className="space-y-1 pt-10 px-10">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="text-green-500 w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Secure Registration</span>
          </div>
          <CardTitle className="text-4xl font-black italic tracking-tighter text-green-500 uppercase leading-none">
            Gia nhập <br /> Scriptify
          </CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 px-10 pt-4">
            {/* Nickname */}
            <div className="space-y-2">
              <Label className="text-zinc-500 font-black text-[10px] uppercase ml-1 italic tracking-widest">bạn tên là gì?</Label>
              <Input
                name="nickname"
                placeholder="Exampled"
                required
                className="border-white/5 bg-white/5 h-14 focus-visible:ring-green-500/30 rounded-2xl italic transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-zinc-400 font-black text-[10px] uppercase ml-1 italic tracking-widest">Email (Nhận mã OTP)</Label>
              <Input
                name="email"
                type="email"
                required
                placeholder="youremail@enample.com"
                className="border-white/5 bg-white/5 h-14 focus-visible:ring-green-500/30 rounded-2xl italic transition-all"
              />
            </div>

            {/* Avatar Upload */}
            <div className="space-y-2">
              <Label className="text-zinc-500 font-black text-[10px] uppercase ml-1 italic tracking-widest">Ảnh đại diện</Label>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="relative group flex-shrink-0">
                  <div className="h-16 w-16 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center bg-zinc-900 overflow-hidden shadow-inner">
                    {avatarPreview ? (
                      <img src={avatarPreview} className="h-full w-full object-cover" alt="Preview" />
                    ) : (
                      <Camera className="text-zinc-700 w-6 h-6" />
                    )}
                  </div>
                  <Input
                    name="avatarFile"
                    type="file"
                    accept="image/*"
                    onChange={onAvatarChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                </div>
                <div className="text-[10px] text-zinc-600 italic font-bold leading-tight">
                  {avatarPreview ? "Mướt đấy sếp! Ảnh này lên Cloud là bao nghệ." : "Chọn một tấm ảnh thật cá tính nhé bạn."}
                </div>
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-tighter ml-1 italic">Mật khẩu</Label>
                <Input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="border-white/5 bg-white/5 h-14 rounded-2xl italic"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-tighter ml-1 italic">Xác nhận</Label>
                <Input
                  name="confirm_password"
                  type="password"
                  required
                  className="border-white/5 bg-white/5 h-14 rounded-2xl italic"
                />
              </div>
            </div>

            {error && (
              <div className="text-[10px] font-black text-red-500 uppercase italic bg-red-500/5 p-3 rounded-xl border border-red-500/10 animate-in fade-in zoom-in-95 tracking-widest text-center">
                ⚠️ {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-6 pb-12 px-10 pt-8">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-green-500 text-black hover:bg-green-400 font-black uppercase italic h-16 rounded-[1.5rem] shadow-2xl shadow-green-500/10 active:scale-95 transition-all text-lg tracking-tighter"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-6 h-6" />
                  <span>Đang khởi tạo...</span>
                </div>
              ) : "Khởi tạo tài khoản"}
            </Button>
            <p className="text-zinc-600 text-center text-[10px] font-black uppercase tracking-widest italic">
              Đã là thành viên?{" "}
              <Link to="/login" className="text-white hover:text-green-500 transition-colors underline underline-offset-4 decoration-white/5">Đăng nhập</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}