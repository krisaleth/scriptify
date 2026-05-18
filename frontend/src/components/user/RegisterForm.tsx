import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Camera, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

// Dùng đường dẫn tương đối để đi qua Proxy nội bộ Docker/Vite
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
    // Chuyển nền tổng thành bg-background
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 transition-colors duration-300">
      {/* Đổi bg-zinc-950, text-white sang Theme Card */}
      <Card className="w-full max-w-md border-border bg-card text-card-foreground shadow-2xl shadow-primary/10 rounded-[2.5rem] overflow-hidden border-t-primary/50 border-t-8 transition-colors duration-300">
        <CardHeader className="space-y-1 pt-10 px-10">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="text-primary w-5 h-5 transition-colors" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground italic transition-colors">Secure Registration</span>
          </div>
          <CardTitle className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-none transition-colors">
            Gia nhập <br /> Scriptify
          </CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 px-10 pt-4">
            {/* Nickname */}
            <div className="space-y-2 group">
              <Label className="text-muted-foreground font-black text-[10px] uppercase ml-1 italic tracking-widest group-focus-within:text-primary transition-colors">bạn tên là gì?</Label>
              <Input
                name="nickname"
                placeholder="Exampled"
                required
                className="border-border bg-secondary/50 text-foreground h-14 focus-visible:ring-primary/50 rounded-2xl italic transition-all placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Email */}
            <div className="space-y-2 group">
              <Label className="text-muted-foreground font-black text-[10px] uppercase ml-1 italic tracking-widest group-focus-within:text-primary transition-colors">Email (Nhận mã OTP)</Label>
              <Input
                name="email"
                type="email"
                required
                placeholder="youremail@example.com"
                className="border-border bg-secondary/50 text-foreground h-14 focus-visible:ring-primary/50 rounded-2xl italic transition-all placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Avatar Upload */}
            <div className="space-y-2">
              <Label className="text-muted-foreground font-black text-[10px] uppercase ml-1 italic tracking-widest transition-colors">Ảnh đại diện</Label>
              <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-2xl border border-border transition-colors">
                <div className="relative group flex-shrink-0">
                  <div className="h-16 w-16 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-secondary overflow-hidden shadow-inner transition-colors group-hover:border-primary/50">
                    {avatarPreview ? (
                      <img src={avatarPreview} className="h-full w-full object-cover" alt="Preview" />
                    ) : (
                      <Camera className="text-muted-foreground w-6 h-6 group-hover:text-primary transition-colors" />
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
                <div className="text-[10px] text-muted-foreground italic font-bold leading-tight transition-colors">
                  {avatarPreview ? "Mướt đấy sếp! Ảnh này lên Cloud là bao nghệ." : "Chọn một tấm ảnh thật cá tính nhé bạn."}
                </div>
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 group">
                <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-tighter ml-1 italic group-focus-within:text-primary transition-colors">Mật khẩu</Label>
                <Input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="border-border bg-secondary/50 text-foreground h-14 focus-visible:ring-primary/50 rounded-2xl italic transition-all"
                />
              </div>
              <div className="space-y-2 group">
                <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-tighter ml-1 italic group-focus-within:text-primary transition-colors">Xác nhận</Label>
                <Input
                  name="confirm_password"
                  type="password"
                  required
                  className="border-border bg-secondary/50 text-foreground h-14 focus-visible:ring-primary/50 rounded-2xl italic transition-all"
                />
              </div>
            </div>

            {error && (
              // Đổi đỏ cứng thành biến destructive
              <div className="text-[10px] font-black text-destructive uppercase italic bg-destructive/10 p-3 rounded-xl border border-destructive/20 animate-in fade-in zoom-in-95 tracking-widest text-center transition-colors">
                ⚠ {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-6 pb-12 px-10 pt-8">
            <Button 
              type="submit" 
              disabled={isLoading}
              // Nút Primary chuẩn Theme
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase italic h-16 rounded-[1.5rem] shadow-2xl shadow-primary/20 active:scale-95 transition-all text-lg tracking-tighter"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-6 h-6" />
                  <span>Đang khởi tạo...</span>
                </div>
              ) : "Khởi tạo tài khoản"}
            </Button>
            <p className="text-muted-foreground text-center text-[10px] font-black uppercase tracking-widest italic transition-colors">
              Đã là thành viên?{" "}
              {/* Link đổi màu tương ứng */}
              <Link to="/login" className="text-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-border hover:decoration-primary/50">Đăng nhập</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}