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
import ProfilePage from "@/components/user/UserProfile";
import { Toaster } from "sonner";
import { GlobalAuthModal } from "@/components/auth/GlobalAuthModal";
import DisclaimerPage from "@/components/user/Disclaimer";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

export default function App() {
  return (
    <>
      {/* 1. Cấu hình Toaster cho toàn bộ App */}
      <Toaster 
        theme="system" 
        position="top-right" 
        richColors 
        duration={3000}
        expand={true}
        className="toaster group"
        toastOptions={{
          className: "group font-sans border-border bg-card text-card-foreground shadow-2xl transition-colors duration-300",
        }}
      />
      <GlobalAuthModal/>

      <Routes>
        {/* Auth Routes - Để ngoài Layout chính */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/verify-otp" element={<OTPForm />} />
        
        {/* Admin Route - Cần bảo vệ nghiêm ngặt */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute> 
              <AdminDashboard /> 
            </ProtectedRoute>
          } 
        />
        
        {/* Main App Layout với Nested Routes */}
        <Route path="/" element={<MusicApp />}>
          {/* Trang chủ */}
          <Route index element={<HomeView />} />
          
          {/* Các trang chức năng công khai */}
          <Route path="albums" element={<AlbumsView />} />
          <Route path="album/:id" element={<AlbumDetailView />} />
          <Route path="artists" element={<ArtistsView />} />
          <Route path="disclaimer" element={<DisclaimerPage />} />

          {/* ✅ Route Trang cá nhân mới thêm */}
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />

          {/* Trang yêu thích */}
          <Route 
            path="favorites" 
            element={
              <ProtectedRoute> 
                <FavoritesView /> 
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Catch-all: Quay về Home nếu gõ bừa URL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}