import { create } from 'zustand';

interface AuthState {
  isAuthModalOpen: boolean;
  token: string | null; // Khai báo thêm ở đây
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setToken: (newToken: string | null) => void; // Khai báo thêm ở đây
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthModalOpen: false,
  
  // Lấy token từ localStorage ngay khi khởi tạo store
  token: localStorage.getItem("token"), 

  openAuthModal: () => set({ isAuthModalOpen: true }),
  
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  // Hàm này cực kỳ quan trọng để "thông báo" cho toàn app khi login/logout
  setToken: (newToken) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // Xóa luôn user khi logout
    }
    set({ token: newToken });
  },
}));