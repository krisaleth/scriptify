import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      // 1. Gọi API Login tới Spring Boot
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. Lưu JWT Token vào localStorage
        localStorage.setItem("token", data.token);
        
        // 3. Chuyển hướng về trang chủ
        navigate("/");
      } else {
        // Xử lý lỗi từ Backend (ví dụ: Sai mật khẩu)
        setError(data.message || "Email hoặc mật khẩu không chính xác");
      }
    } catch (err) {
      setError("Không thể kết nối tới máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4 sm:p-6">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-white shadow-2xl">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Sign in to Scriptify
          </CardTitle>
          {error && (
            <p className="text-sm font-medium text-red-500 bg-red-500/10 p-2 rounded">
              {error}
            </p>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-zinc-300">Email</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-zinc-300">Password</Label>
              <Input
                id="login-password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-green-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-green-500 text-black hover:bg-green-600 font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <p className="text-zinc-400 text-center text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-green-400 font-medium underline-offset-4 hover:underline hover:text-green-300"
              >
                Sign up now
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}