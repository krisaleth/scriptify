export const getResourceUrl = (path: string | null | undefined): string => {
  const R2_URL = import.meta.env.VITE_R2_PUBLIC_URL;

  if (!path) return '/assets/default-avatar.png';
  if (path.startsWith('http')) return path;

  if (!R2_URL) {
    // Nếu biến môi trường lỗi, tạm thời nối cứng link R2 vào đây để test 
    // const TEMP_R2 = "https://pub-xxxx.r2.dev";
    // return `${TEMP_R2}/${encodeURI(path.replace(/^\//, ""))}`;
    return `http://localhost:8443/${path}`; 
  }

  const cleanBase = R2_URL.endsWith('/') ? R2_URL.slice(0, -1) : R2_URL;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${cleanBase}/${encodeURI(cleanPath)}`;
};