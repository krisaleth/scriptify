import React, { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { LoginForm } from "./components/user/LoginForm";
import { OTPForm } from "./components/user/OTPForm";
import { RegisterForm } from "./components/user/RegisterForm";
import { AlbumDetailView } from "./components/user/album-detail-view";
import { AlbumsView } from "./components/user/albums-view";
import { ArtistsView } from "./components/user/artists-view";
import { CategoryView } from "./components/user/browse-view";
import { FavouritesView } from "./components/user/favourites-view";
import { HomeView } from "./components/user/home-view";
import { MusicPlayer } from "./components/user/music-player";
import { Sidebar } from "./components/user/sidebar";

function MusicApp() {
  const [currentView, setCurrentView] = useState("home");
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayTrack = (trackId: number) => {
    setCurrentTrackId(trackId);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const renderMusicView = () => {
    if (currentView.startsWith("album-")) {
      const albumId = parseInt(currentView.split("-")[1]);
      return (
        <AlbumDetailView
          albumId={albumId}
          onBack={() => setCurrentView("albums")}
          onPlayTrack={handlePlayTrack}
        />
      );
    }

    switch (currentView) {
      case "home":
        return <HomeView onPlayTrack={handlePlayTrack} />;
      case "albums":
        return (
          <AlbumsView
            onPlayTrack={handlePlayTrack}
            onViewAlbum={(id) => setCurrentView(`album-${id}`)}
          />
        );
      case "artists":
        return <ArtistsView onPlayTrack={handlePlayTrack} />;
      case "favourites":
        return <FavouritesView onPlayTrack={handlePlayTrack} />;
      case "category":
        return <CategoryView onPlayTrack={handlePlayTrack} />;
      default:
        return <HomeView onPlayTrack={handlePlayTrack} />;
    }
  };

  return (
    <div className="flex size-full min-h-svh flex-col bg-black">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        {renderMusicView()}
      </div>
      <MusicPlayer
        currentTrackId={currentTrackId}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Đã gỡ bỏ AuthScreen, gọi thẳng Form để ăn trọn CSS màu đen */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/otp" element={<OTPForm />} />
      
      {/* Admin cũng gọi thẳng, không bọc thẻ div màu trắng nữa */}
      <Route path="/admin" element={<AdminDashboard />} />
      
      <Route path="/" element={<MusicApp />} />
      <Route path="/home" element={<MusicApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}