import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  isAuthModalOpen: boolean;
  user: any | null;
  isInitialized: boolean; // Thêm biến này để check trạng thái kiểm tra token ban đầu
  
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setUser: (newUser: any | null) => void;
  logout: () => void;
  setInitialized: (val: boolean) => void; // Để báo là đã check xong với BE
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthModalOpen: false,
      user: null,
      isInitialized: false, // Mặc định chưa check

      openAuthModal: () => set({ isAuthModalOpen: true }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),
      setInitialized: (val) => set({ isInitialized: val }),

      setUser: (newUser) => set({ user: newUser, isInitialized: true }),

      logout: () => {
        set({ user: null, isAuthModalOpen: false, isInitialized: true });
        // Xóa sạch dấu vết LocalStorage
        localStorage.removeItem('scriptify-auth-storage');
      },
    }),
    {
      name: 'scriptify-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);