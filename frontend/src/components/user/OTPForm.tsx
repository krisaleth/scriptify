import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";

export function OTPForm() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Lấy email từ state mà trang Register đã gửi sang
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  // Nếu truy cập trực tiếp vào trang này mà không có email, đá về trang đăng ký
  useEffect(() => {
    if (!email) {
      navigate("/register", {replace: true});
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
        // Xác thực xong thì về Login thôi bồ!
        alert("Xác thực tài khoản thành công! Giờ bồ có thể đăng nhập.");
        navigate("/login");
      } else {
        const data = await response.json();
        setError(data.message || "Mã xác thực không đúng hoặc đã hết hạn.");
      }
    } catch (err) {
      setError("Không thể kết nối tới server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async (email: string): Promise<void> => {
    if (isResending) return;
    setIsResending(true);
    try {
        const params = new URLSearchParams({ email });

        const response = await fetch(`http://localhost:8080/api/auth/resend?${params.toString()}`, {
            method: 'POST',
        });

        const data = await response.text();

        if (response.ok) {
            alert("Mã OTP đã được gửi! Bồ hãy kiểm tra email của mình nhé!");
        } else {
            alert(`Lỗi từ Server: ${data}`);
        }
    } catch (error) {
        console.error("Lỗi kết nối:", error);
        alert("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng!");
    }
    finally {
      setIsResending(false);
    }
};

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4 sm:p-6">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-white shadow-2xl">
        <CardHeader className="space-y-2 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Xác thực tài khoản
          </CardTitle>
          <p className="text-sm text-zinc-400">
            Chúng mình đã gửi mã xác thực đến email: <br />
            <span className="text-green-400 font-medium">{email}</span>
          </p>
          {error && (
            <div className="mt-2 rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
              {error}
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleVerify}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code" className="text-zinc-300">
                Mã xác thực (OTP)
              </Label>
              <Input
                id="verification-code"
                name="verification_code"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                autoComplete="one-time-code"
                placeholder="Nhập 6 chữ số"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-green-500 text-center text-2xl tracking-[0.5em] h-14"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button 
              type="submit" 
              disabled={isLoading || otp.length < 6}
              className="w-full bg-green-500 text-black hover:bg-green-600 font-bold h-12"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "XÁC NHẬN"}
            </Button>
            
            <div className="flex flex-col space-y-2 mt-2 w-full text-center text-sm">
              <p className="text-zinc-400">
                Chưa nhận được mã?{" "}
                <button 
                  onClick={() => handleResendCode(email)}
                  disabled={isResending}
                  type="button" 
                  className="text-green-400 font-medium underline-offset-4 hover:underline hover:text-green-300"
                >
                  {isResending ? "Đang gửi" : "Gửi lại mã"}
                </button>
              </p>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-zinc-500 font-medium hover:text-zinc-300 mt-4 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại đăng nhập
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}