import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, ShieldCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// Dùng đường dẫn tương đối để đi xuyên qua Proxy nội bộ Docker
const API_BASE = "/api";

export function OTPForm() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0); 

  useEffect(() => {
    if (!email) {
      toast.error("Thiếu thông tin xác thực", {
        description: "Vui lòng đăng ký lại để nhận mã OTP bạn nhé."
      });
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  // Logic đếm ngược 60s để tránh spam BE
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length < 6) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ 
        email: email, 
        verificationCode: otp 
      });

      const response = await fetch(`${API_BASE}/auth/verify?${params.toString()}`, { 
        method: "POST",
        credentials: "include" 
      });

      if (response.ok) {
        toast.success("Xác thực thành công!", {
          description: "Chào mừng bạn gia nhập gia đình Scriptify Cloud."
        });
        navigate("/login", { replace: true });
      } else {
        const data = await response.json();
        setError(data.message || "Mã xác thực không chính xác hoặc đã hết hạn.");
      }
    } catch (err) {
      setError("Không thể kết nối tới Proxy xác thực.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (isResending || countdown > 0 || !email) return;
    
    setIsResending(true);
    try {
      const params = new URLSearchParams({ email });
      const response = await fetch(`${API_BASE}/auth/resend?${params.toString()}`, {
        method: 'POST',
        credentials: "include"
      });

      if (response.ok) {
        toast.success("Đã gửi mã mới!", {
          description: "bạn check lại hòm thư (kể cả Spam) nhé."
        });
        setCountdown(60); 
      } else {
        const data = await response.text();
        toast.error("Gửi lại thất bại", { description: data });
      }
    } catch (error) {
      toast.error("Lỗi hệ thống", { description: "Proxy không thể gửi yêu cầu resend." });
    } finally {
      setIsResending(false);
    }
  };

  return (
    // Chuyển nền tổng thành bg-background
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 transition-colors duration-300">
      {/* Đổi bg-zinc-950, text-white sang Theme Card */}
      <Card className="w-full max-w-md border-border bg-card text-card-foreground shadow-2xl shadow-primary/10 rounded-[2.5rem] overflow-hidden border-t-primary/50 border-t-8 transition-colors duration-300">
        <CardHeader className="space-y-2 text-center pt-12 px-8">
          <div className="mx-auto w-14 h-14 bg-secondary/50 rounded-full flex items-center justify-center mb-4 border border-border transition-colors">
            <ShieldCheck className="text-primary w-7 h-7 transition-colors" />
          </div>
          <CardTitle className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-none transition-colors">
            Xác thực OTP
          </CardTitle>
          <div className="text-muted-foreground text-[10px] font-black leading-relaxed uppercase tracking-[0.2em] italic transition-colors">
            Giai điệu đã gửi tới: <br />
            <span className="text-foreground/70 lowercase select-all transition-colors">{email}</span>
          </div>
        </CardHeader>
        
        <form onSubmit={handleVerify}>
          <CardContent className="space-y-8 px-10 pt-6">
            <div className="space-y-4 group">
              <Label htmlFor="verification-code" className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.3em] block text-center italic transition-colors group-focus-within:text-primary">
                Nhập 6 mã số định danh
              </Label>
              <Input
                id="verification-code"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                required
                autoFocus
                placeholder="000000"
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-primary/50 text-center text-5xl font-black tracking-[0.4em] h-24 rounded-3xl transition-all italic"
              />
            </div>

            {error && (
              // Đổi đỏ cứng thành biến destructive, bỏ icon Emoji
              <div className="rounded-2xl bg-destructive/10 p-4 text-[10px] font-black text-destructive border border-destructive/20 text-center uppercase italic tracking-widest animate-in fade-in slide-in-from-top-1 transition-colors">
                {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-6 pb-14 px-10 pt-6">
            <Button 
              type="submit" 
              disabled={isLoading || otp.length < 6}
              // Nút Primary chuẩn Theme
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase italic h-16 rounded-[1.5rem] shadow-2xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-30 text-lg tracking-tighter"
            >
              {isLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : "Kích hoạt tài khoản"}
            </Button>
            
            <div className="flex flex-col space-y-8 w-full text-center">
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest italic transition-colors">
                Chưa nhận được mã?{" "}
                <button 
                  onClick={handleResendCode}
                  disabled={isResending || countdown > 0}
                  type="button" 
                  className="text-foreground hover:text-primary transition-colors disabled:text-muted-foreground/50 ml-1 underline underline-offset-4 decoration-border hover:decoration-primary/50"
                >
                  {isResending ? (
                    <RefreshCw className="w-3 h-3 animate-spin inline mr-1" />
                  ) : null}
                  {countdown > 0 ? `Gửi lại sau (${countdown}s)` : "Gửi lại ngay"}
                </button>
              </p>
              
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-muted-foreground font-black hover:text-foreground transition-all uppercase text-[9px] tracking-[0.3em] italic"
              >
                <ArrowLeft className="w-3 h-3" />
                Hủy kết nối
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}