import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogOverlay } from "@/components/ui/dialog";
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
    // AnimatePresence giúp xử lý hiệu ứng khi component bị gỡ bỏ khỏi DOM
    <AnimatePresence>
      {isAuthModalOpen && (
        <Dialog open={isAuthModalOpen} onOpenChange={closeAuthModal}>
          <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
          
          <DialogContent 
            onPointerDownOutside={(e) => e.preventDefault()} // Ngăn đóng đột ngột để animation chạy
            className="border-none bg-transparent shadow-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} // Trạng thái bắt đầu
              animate={{ opacity: 1, scale: 1, y: 0 }}    // Trạng thái hiện tại
              exit={{ opacity: 0, scale: 0.95, y: 10 }}   // Trạng thái khi đóng
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 300,
                duration: 0.2 
              }}
              className="bg-zinc-950 border-2 border-zinc-800 text-white p-8 rounded-3xl shadow-[0_0_50px_-12px_rgba(34,197,94,0.3)] max-w-md w-full mx-auto"
            >
              <DialogHeader>
                <DialogTitle className="text-3xl font-black italic tracking-tighter text-green-500 mb-2">
                  Dừng lại một chút!
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-base leading-relaxed">
                  Bồ cần đăng nhập để thực hiện tính năng này. Hãy tham gia cùng cộng đồng **Scriptify** ngay nhé.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="mt-8 flex flex-row gap-3">
                <Button 
                  variant="ghost" 
                  onClick={closeAuthModal} 
                  className="flex-1 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full h-12"
                >
                  Để sau
                </Button>
                <Button 
                  className="flex-1 bg-green-500 text-black hover:bg-green-400 font-bold rounded-full h-12 px-6 shadow-[0_0_20px_rgba(34,197,94,0.4)]" 
                  onClick={handleLogin}
                >
                  <LogIn className="w-5 h-5 mr-2" /> Đăng nhập
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}