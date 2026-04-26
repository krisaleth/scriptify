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
          {/* Lớp phủ mờ toàn màn hình - Tăng độ mờ để nổi bật modal */}
          <DialogOverlay className="bg-black/80 backdrop-blur-md z-[100]" />
          
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
              // Đây mới là cái khung thực sự che phủ nội dung
              className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(34,197,94,0.1)] w-full overflow-hidden"
            >
              <div className="space-y-6">
                <div className="flex justify-center md:justify-start">
                  <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                    <LogIn className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
                    Private <span className="text-green-500">Lounge</span>
                  </h2>
                  <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-medium">
                    bạn cần đăng nhập để truy cập kho giai điệu riêng tư của mình trên <span className="text-zinc-200">Scriptify Cloud</span>.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button 
                    variant="ghost" 
                    onClick={closeAuthModal} 
                    className="flex-1 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl h-14 uppercase font-black tracking-widest text-[10px] italic transition-all"
                  >
                    Để sau
                  </Button>
                  <Button 
                    className="flex-1 bg-green-500 text-black hover:bg-green-400 font-black rounded-2xl h-14 px-6 shadow-[0_10px_20px_rgba(34,197,94,0.2)] uppercase tracking-widest text-[10px] italic transition-all active:scale-95" 
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