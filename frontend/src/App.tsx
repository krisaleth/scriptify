import { Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "@/components/user/LoginForm";
import { RegisterForm } from "@/components/user/RegisterForm";
import { OTPForm } from "@/components/user/OTPForm";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import MusicApp from "./layouts/MusicApp";
import { HomeView } from "@/components/user/HomeView";
import { AlbumsView } from "@/components/user/AlbumsView";
import { AlbumDetailView } from "@/components/user/AlbumDetailView";
import { ArtistsView } from "@/components/user/ArtistsView";
import { FavoritesView } from "@/components/user/FavoritesView";
import { Toaster } from "sonner";
import { GlobalAuthModal } from "@/components/auth/GlobalAuthModal";

export default function App() {
  return (
    <>
      {/* 1. Cấu hình Toaster cho toàn bộ App */}
      <Toaster 
        theme="dark" 
        position="top-right" 
        richColors 
        duration={3000}
        expand={true}
        className="toaster group"
        toastOptions={{
          className: "group font-sans border-zinc-800 bg-zinc-900 text-white shadow-2xl",
        }}
      />
      <GlobalAuthModal/>

      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/verify-otp" element={<OTPForm />} />
        
        {/* Admin Route */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Main App Layout với Nested Routes */}
        <Route path="/" element={<MusicApp />}>
          {/* Dùng index cho trang chủ */}
          <Route index element={<HomeView />} />
          
          {/* Các trang chức năng của Scriptify */}
          <Route path="albums" element={<AlbumsView />} />
          <Route path="album/:id" element={<AlbumDetailView />} />
          <Route path="artists" element={<ArtistsView />} />
          <Route path="favorites" element={<FavoritesView />} />
        </Route>

        {/* Catch-all: Quay về Home nếu gõ bừa URL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}