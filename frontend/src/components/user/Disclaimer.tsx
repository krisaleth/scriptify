import React from 'react';
import { ShieldAlert, Mail, Copyright, Gavel, Globe, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DisclaimerPage = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-green-500/30 relative overflow-x-hidden">
      {/* Nút quay lại cho Mobile */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 p-3 rounded-full bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:border-green-500/50 transition-all z-50 md:hidden active:scale-90"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Background Decor - Hiệu ứng ánh sáng xanh mờ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-green-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-green-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <header className="mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-[1px] bg-green-500"></div>
            <span className="text-green-500 font-black uppercase tracking-[0.3em] text-[10px] italic">
              Legal Documentation
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">
            Miễn trừ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
              Trách nhiệm
            </span>
          </h1>
        </header>

        {/* Content Grid - Đã đồng bộ tất cả vào thẻ (Cards) */}
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 delay-200 duration-1000">
          
          {/* Card 01: Project Purpose */}
          <section className="p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 group hover:border-green-500/30 transition-all duration-500">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="p-3 rounded-xl bg-black border border-white/10 group-hover:scale-110 transition-transform duration-500 shrink-0">
                <Globe className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest italic mb-4">
                  01. Mục đích dự án
                </h2>
                <p className="leading-relaxed text-zinc-400 text-sm md:text-base">
                  <strong className="text-white font-bold">Scriptify (xcode.id.vn)</strong> là một nền tảng âm thanh phi lợi nhuận, được xây dựng cho mục đích học tập và nghiên cứu công nghệ. Toàn bộ kho nhạc hiện có được sử dụng làm dữ liệu mẫu (Sample Data) để minh họa cho khả năng streaming server.
                </p>
              </div>
            </div>
          </section>

          {/* Card 02: Copyright */}
          <section className="p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 group hover:border-green-500/30 transition-all duration-500">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="p-3 rounded-xl bg-black border border-white/10 group-hover:scale-110 transition-transform duration-500 shrink-0">
                <Copyright className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest italic mb-4">
                  02. Sở hữu trí tuệ
                </h2>
                <p className="leading-relaxed text-zinc-400 text-sm md:text-base">
                  Tất cả tài nguyên âm thanh và hình ảnh thuộc về chủ sở hữu bản quyền tương ứng. Chúng tôi không kinh doanh nội dung này. Scriptify hoạt động dựa trên nguyên tắc <span className="text-white italic underline decoration-green-500/50 font-medium cursor-help">Fair Use</span> cho mục đích giáo dục.
                </p>
              </div>
            </div>
          </section>

          {/* Card 03: Takedown Policy (Special focus) */}
          <section className="p-8 rounded-[2rem] bg-zinc-900/60 border border-green-500/20 relative overflow-hidden group hover:bg-green-500/[0.02] transition-all duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldAlert className="w-32 h-32 text-green-500" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-black border border-green-500/30 shrink-0">
                   <Gavel className="w-6 h-6 text-green-500" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest italic">
                  03. Chính sách gỡ bỏ (DMCA)
                </h2>
              </div>
              <p className="text-zinc-400 mb-8 max-w-2xl text-sm md:text-base leading-relaxed">
                Nếu bạn là tác giả và muốn nội dung của mình được gỡ bỏ khỏi hệ thống thử nghiệm này, vui lòng liên hệ qua hòm thư quản trị. Chúng tôi cam kết phản hồi và xử lý nội dung trong vòng 24-48 giờ.
              </p>
              <a 
                href="mailto:kimngoctam15@gmail.com" 
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-green-500 text-black font-black uppercase text-[10px] tracking-widest hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:scale-105 active:scale-95 transition-all"
              >
                <Mail className="w-4 h-4" />
                Gửi yêu cầu gỡ bỏ
              </a>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 italic text-center">
            © {currentYear} Scriptify Project // Developed by Krisaleth
          </p>
          <button 
            onClick={() => navigate("/")}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-green-500 transition-colors italic group flex items-center gap-2"
          >
            Trở về trang chủ <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DisclaimerPage;