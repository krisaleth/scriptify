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

export function RegisterForm() {
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  React.useEffect(
    () => () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    },
    [avatarPreview],
  );

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4 sm:p-6">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-white shadow-2xl">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Sign up for Scriptify
          </CardTitle>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: Xử lý logic gọi API Đăng ký ở đây
          }}
        >
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-username" className="text-zinc-300">Username</Label>
              <Input
                id="register-username"
                name="username"
                autoComplete="username"
                placeholder="Choose a username"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email" className="text-zinc-300">Email</Label>
              <Input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-display-name" className="text-zinc-300">Display name</Label>
              <Input
                id="register-display-name"
                name="display_name"
                autoComplete="name"
                placeholder="How should we call you?"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-avatar" className="text-zinc-300">Upload Avatar</Label>
              <Input
                id="register-avatar"
                name="avatar"
                type="file"
                accept="image/*"
                onChange={onAvatarChange}
                className="cursor-pointer border-zinc-700 bg-zinc-800 text-zinc-300 file:me-3 file:rounded-md file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white focus-visible:ring-green-500"
              />
              {/* Nâng cấp UX: Hiện hẳn ảnh hình tròn cho ngầu */}
              {avatarPreview && (
                <div className="mt-3 flex items-center gap-3 rounded-md border border-zinc-800 bg-black/50 p-2">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-10 w-10 rounded-full object-cover border border-zinc-700"
                  />
                  <p className="text-xs text-zinc-400">Looking good!</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password" className="text-zinc-300">Password</Label>
              <Input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-green-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button type="submit" className="w-full bg-green-500 text-black hover:bg-green-600 font-semibold">
              Sign Up
            </Button>
            <p className="text-zinc-400 text-center text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-green-400 font-medium underline-offset-4 hover:underline hover:text-green-300"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}