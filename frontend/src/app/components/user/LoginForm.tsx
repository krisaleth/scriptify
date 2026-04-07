import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function LoginForm() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4 sm:p-6">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-white shadow-2xl">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Sign in to Scriptify
          </CardTitle>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: Xử lý logic gọi API Đăng nhập ở đây
          }}
        >
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-username" className="text-zinc-300">Username</Label>
              <Input
                id="login-username"
                name="username"
                autoComplete="username"
                placeholder="Enter your username"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-zinc-300">Password</Label>
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-green-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button type="submit" className="w-full bg-green-500 text-black hover:bg-green-600 font-semibold">
              Sign In
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