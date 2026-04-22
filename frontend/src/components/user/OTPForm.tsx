import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner"; // Đã thêm toast

export function OTPForm() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Thiếu thông tin xác thực", {
        description: "Vui lòng đăng ký lại để nhận mã OTP bồ nhé."
      });
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8080/api/auth/verify?email=${encodeURIComponent(email)}&verificationCode=${otp}`,
        { method: "POST" }
      );

      if (response.ok) {
        toast.success("Xác thực thành công!", {
          description: "Tài khoản đã sẵn sàng. Đăng nhập ngay thôi bồ!"
        });
        navigate("/login");
      } else {
        const data = await response.json();
        const msg = data.message || "Mã xác thực không đúng hoặc đã hết hạn.";
        setError(msg);
        // Không dùng toast ở đây vì đã hiện lỗi đỏ trên form cho gọn
      }
    } catch (err) {
      setError("Không thể kết nối tới server.");
      toast.error("Lỗi kết nối", { description: "Kiểm tra lại mạng hoặc Docker BE nhé bồ." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (isResending || !email) return;
    setIsResending(true);
    
    try {
        const params = new URLSearchParams({ email });
        const response = await fetch(`http://localhost:8080/api/auth/resend?${params.toString()}`, {
            method: 'POST',
        });

        if (response.ok) {
            toast.success("Đã gửi mã mới!", {
                description: "Bồ check lại hộp thư đến (hoặc spam) nhé."
            });
        } else {
            const data = await response.text();
            toast.error("Gửi lại thất bại", { description: data });
        }
    } catch (error) {
        toast.error("Lỗi hệ thống", { description: "Không thể kết nối để gửi lại mã." });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4 sm:p-6">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-white shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="space-y-2 text-center pt-10 px-8">
          <CardTitle className="text-3xl font-black italic tracking-tighter text-green-500 uppercase">
            Xác thực tài khoản
          </CardTitle>
          <div className="text-zinc-500 text-[11px] font-medium leading-relaxed uppercase tracking-wider">
            Chúng mình đã gửi mã OTP đến: <br />
            <span className="text-zinc-300 lowercase font-bold">{email}</span>
          </div>
        </CardHeader>
        
        <form onSubmit={handleVerify}>
          <CardContent className="space-y-6 px-10 pt-4">
            <div className="space-y-4">
              <Label htmlFor="verification-code" className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest block text-center">
                Mã xác thực gồm 6 chữ số
              </Label>
              <Input
                id="verification-code"
                name="verification_code"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} // Chỉ cho nhập số
                maxLength={6}
                required
                autoComplete="one-time-code"
                placeholder="000000"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-700 focus-visible:ring-green-500 text-center text-3xl font-black tracking-[0.4em] h-16 rounded-2xl"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 p-3 text-[11px] font-bold text-red-500 border border-red-500/20 text-center uppercase italic animate-in fade-in slide-in-from-top-1">
                ⚠️ {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pb-12 px-10 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || otp.length < 6}
              className="w-full bg-green-500 text-black hover:bg-green-400 font-black uppercase italic h-14 rounded-2xl shadow-lg shadow-green-500/10 active:scale-95 transition-all"
            >
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Xác nhận ngay"}
            </Button>
            
            <div className="flex flex-col space-y-4 w-full text-center text-xs">
              <p className="text-zinc-500 font-medium">
                Chưa nhận được mã?{" "}
                <button 
                  onClick={handleResendCode}
                  disabled={isResending}
                  type="button" 
                  className="text-green-500 font-bold hover:text-green-400 transition-colors disabled:opacity-50"
                >
                  {isResending ? "Đang gửi lại..." : "Gửi lại mã"}
                </button>
              </p>
              
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-zinc-500 font-bold hover:text-zinc-300 transition-all uppercase text-[10px] tracking-widest"
              >
                <ArrowLeft className="w-3 h-3" />
                Quay lại đăng nhập
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}