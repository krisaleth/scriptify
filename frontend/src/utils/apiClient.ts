import { useAuthStore } from "@/store/useAuthStore";

export async function apiRequest(url: string, options: RequestInit = {}) {
  // Luôn gửi kèm credentials để Backend đọc được HttpOnly Cookie
  options.credentials = "include";

  const response = await fetch(url, options);

  // 1. Nếu Backend báo lỗi bảo mật (Token cũ/hết hạn)
  if (response.status === 401 || (response.status === 400 && url.includes("/api/user/me"))) {
    const store = useAuthStore.getState();
    if (store.user) {
      console.warn("Scriptify: Phiên đăng nhập đã hết hạn. Đang tự động đăng xuất...");
      store.logout();
    }
    return null;
  }

  if (!response.ok) {
    return null; 
  }

  // 3. Trả về data sạch
  return response.json();
}