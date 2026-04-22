import { create } from 'zustand';

interface AuthState {
  isAuthModalOpen: boolean;
  token: string | null;
  user: any | null; // Thêm user vào đây
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setToken: (newToken: string | null) => void;
  setUser: (newUser: any | null) => void; // Thêm hàm cập nhật user
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthModalOpen: false,
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user") || "null"), // Lấy user từ local

  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  setToken: (newToken) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    set({ token: newToken });
  },

  setUser: (newUser) => {
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
    set({ user: newUser });
  }
}));