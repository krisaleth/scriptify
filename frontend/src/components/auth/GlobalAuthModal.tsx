import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalAuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = () => {
    closeAuthModal();
    navigate("/login");
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <Dialog open={isAuthModalOpen} onOpenChange={closeAuthModal}>
          {/* Lớp phủ mờ toàn màn hình - Đã đổi bg-black thành bg-background để tự ăn theo Theme */}
          <DialogOverlay className="bg-background/80 backdrop-blur-md z-[100] transition-colors duration-300" />
          
          <DialogContent 
            onPointerDownOutside={(e) => e.preventDefault()}
            // QUAN TRỌNG: Thêm 'fixed' và các class reset để loại bỏ khung mặc định của shadcn
            className="fixed left-[50%] top-[50%] z-[101] translate-x-[-50%] translate-y-[-50%] border-none bg-transparent p-0 shadow-none sm:max-w-md w-[90vw] focus:outline-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              // Thay màu cứng bằng biến Theme card, viền border, tự động tạo bóng theo primary
              className="bg-card border border-border p-8 rounded-[2.5rem] shadow-2xl shadow-primary/10 w-full overflow-hidden transition-colors duration-300"
            >
              <div className="space-y-6">
                <div className="flex justify-center md:justify-start">
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 transition-colors duration-300">
                    <LogIn className="w-8 h-8 text-primary transition-colors duration-300" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-black italic tracking-tighter text-foreground uppercase transition-colors duration-300">
                    Private <span className="text-primary transition-colors duration-300">Lounge</span>
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-medium transition-colors duration-300">
                    Bạn cần đăng nhập để truy cập kho giai điệu riêng tư của mình trên <span className="text-foreground transition-colors duration-300">Scriptify Cloud</span>.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button 
                    variant="ghost" 
                    onClick={closeAuthModal} 
                    className="flex-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-2xl h-14 uppercase font-black tracking-widest text-[10px] italic transition-all duration-300"
                  >
                    Để sau
                  </Button>
                  <Button 
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-black rounded-2xl h-14 px-6 shadow-lg shadow-primary/20 uppercase tracking-widest text-[10px] italic transition-all duration-300 active:scale-95" 
                    onClick={handleLogin}
                  >
                    <LogIn className="w-4 h-4 mr-2" /> Đăng nhập ngay
                  </Button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}