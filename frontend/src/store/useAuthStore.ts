import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  isAuthModalOpen: boolean;
  user: any | null; // Lưu object thông tin user (nickname, avatar, role...)
  
  openAuthModal: () => void;
  closeAuthModal: () => void;
  
  // Chỉ cập nhật thông tin User, Token sẽ do trình duyệt tự gửi qua Cookie
  setUser: (newUser: any | null) => void;
  
  // Hàm dọn dẹp sạch sẽ khi thoát
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthModalOpen: false,
      user: null, // Khởi tạo là null

      openAuthModal: () => set({ isAuthModalOpen: true }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),

      setUser: (newUser) => set({ user: newUser }),

      logout: () => {
        // Xóa thông tin user trong store và localStorage
        set({ user: null, isAuthModalOpen: false });
        // Token trong HttpOnly Cookie sẽ được xóa bằng cách gọi API Logout từ Backend
      },
    }),
    {
      name: 'scriptify-auth-storage', // Tên key lưu trong LocalStorage
      storage: createJSONStorage(() => localStorage),
      // Chỉ lưu field 'user', không lưu trạng thái đóng/mở modal
      partialize: (state) => ({ user: state.user }),
    }
  )
);