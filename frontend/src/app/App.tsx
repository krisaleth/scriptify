import { 
  Routes, 
  Route, 
  Navigate 
} from "react-router-dom";

import { LoginForm } from "./components/user/LoginForm";
import { RegisterForm } from "./components/user/RegisterForm";
import { OTPForm } from "./components/user/OTPForm";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import MusicApp from "./layouts/MusicApp";
import { HomeView } from "./components/user/home-view";
import { AlbumsView } from "./components/user/albums-view";
import { AlbumDetailView } from "./components/user/album-detail-view";
import { ArtistsView } from "./components/user/artists-view";
import { FavoritesView } from "./components/user/favorites-view";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/verify-otp" element={<OTPForm />} />
      <Route path="/admin" element={<AdminDashboard />} />
      
      {/* Các route con của MusicApp */}
      <Route path="/" element={<MusicApp />}>
        <Route index element={<HomeView />} />
        <Route path="/" element={<HomeView />} />
        <Route path="albums" element={<AlbumsView />} />
        <Route path="album/:id" element={<AlbumDetailView />} />
        <Route path="artists" element={<ArtistsView />} />
        <Route path="favorites" element={<FavoritesView />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}