import { useAuthStore } from "@/store/useAuthStore";

/**
 * ✅ API Client thông minh: 
 * Tự động xử lý Logout khi JWT hết hạn (status 400/401)
 */
export async function apiRequest(url: string, options: RequestInit = {}) {
  // Luôn gửi kèm credentials để Backend đọc được HttpOnly Cookie
  options.credentials = "include";

  const response = await fetch(url, options);

  // 1. Nếu Backend báo lỗi bảo mật (Token cũ/hết hạn)
  if (response.status === 401 || (response.status === 400 && url.includes("/api/user/me"))) {
    const store = useAuthStore.getState();
    if (store.user) {
      console.warn("Scriptify: Phiên đăng nhập đã hết hạn. Đang tự động đăng xuất...");
      store.logout(); // Tự động xóa user trong Zustand
    }
    return null;
  }

  // 2. Chặn lỗi Parse JSON nếu response không phải định dạng JSON hoặc rỗng
  if (!response.ok) {
    // Không parse JSON nếu response lỗi để tránh SyntaxError
    return null; 
  }

  // 3. Trả về data sạch
  return response.json();
}