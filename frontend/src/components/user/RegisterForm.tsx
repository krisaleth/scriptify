import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";

export function RegisterForm() {
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp. Bồ kiểm tra lại nhé!");
      return;
    }
    setIsLoading(true);
    
    // Lấy email từ FormData để truyền sang trang OTP sau khi đăng ký thành công
    const email = formData.get("email")?.toString();

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
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/verify-otp", { state: { email: email } });
        }, 2000);
      } else {
        setError(data?.message || "Đăng ký thất bại. Email hoặc Tên đăng nhập có thể đã tồn tại!");
      }
    } catch (err) {
      setError("Không thể kết nối tới máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-black p-4">
        <div className="text-center animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="mx-auto h-20 w-20 text-green-500 mb-6 animate-bounce" />
          <h2 className="text-3xl font-bold text-white mb-2">Đăng ký thành công!</h2>
          <p className="text-zinc-400">Đang chuẩn bị gửi mã OTP đến email của bồ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4 sm:p-6">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-white shadow-2xl">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Đăng ký Scriptify
          </CardTitle>
          {error && (
            <div className="mt-2 rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20 animate-in slide-in-from-top-1">
              {error}
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-nickname" className="text-zinc-300">Tên đăng nhập</Label>
              <Input
                id="register-nickname"
                name="nickname"
                placeholder="Nhập tên đăng nhập của bồ"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email" className="text-zinc-300">Email</Label>
              <Input
                id="register-email"
                name="email"
                type="email"
                required
                placeholder="ten@vi-du.com"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-avatar" className="text-zinc-300">Ảnh đại diện</Label>
              <Input
                id="register-avatar"
                name="avatarFile"
                type="file"
                accept="image/*"
                onChange={onAvatarChange}
                className="cursor-pointer border-zinc-700 bg-zinc-800 text-zinc-300 file:me-3 file:rounded-md file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white focus-visible:ring-green-500"
              />
              {avatarPreview && (
                <div className="mt-3 flex items-center gap-3 rounded-md border border-zinc-800 bg-black/50 p-2">
                  <img
                    src={avatarPreview}
                    alt="Xem trước ảnh"
                    className="h-10 w-10 rounded-full object-cover border border-zinc-700 shadow-sm"
                  />
                  <p className="text-xs text-zinc-400">Avatar trông "bánh cuốn" đấy!</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password" className="text-zinc-300">Mật khẩu</Label>
              <Input
                id="register-password"
                name="password"
                type="password"
                required
                placeholder="Tạo mật khẩu mạnh nè"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-zinc-300">Xác nhận mật khẩu</Label>
              <Input
                id="confirm-password"
                name="confirm_password"
                type="password"
                required
                placeholder="Nhập lại mật khẩu cho chắc"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-green-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-green-500 text-black hover:bg-green-600 font-bold text-base transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang tạo tài khoản...
                </>
              ) : (
                "Đăng Ký Ngay"
              )}
            </Button>
            <p className="text-zinc-400 text-center text-sm">
              Đã có tài khoản rồi?{" "}
              <Link
                to="/login"
                className="text-green-400 font-medium underline-offset-4 hover:underline hover:text-green-300 transition-colors"
              >
                Đăng nhập
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}