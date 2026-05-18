import React from 'react';
import { ShieldAlert, Mail, Copyright, Gavel, Globe, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DisclaimerPage = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  return (
    // ✅ Chèn thêm transition-colors duration-300 để lật mode mượt mà
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 relative overflow-x-hidden transition-colors duration-300">
      {/* Nút quay lại cho Mobile */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 p-3 rounded-full bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all z-50 md:hidden active:scale-90"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Background Decor - Hiệu ứng ánh sáng mờ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none transition-colors duration-300">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] transition-colors duration-300" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] transition-colors duration-300" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <header className="mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-[1px] bg-primary transition-colors"></div>
            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] italic transition-colors">
              Legal Documentation
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-foreground uppercase tracking-tighter italic leading-none transition-colors">
            Miễn trừ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
              Trách nhiệm
            </span>
          </h1>
        </header>

        {/* Content Grid */}
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 delay-200 duration-1000">
          
          {/* Card 01: Project Purpose */}
          <section className="p-8 rounded-[2rem] bg-secondary/40 border border-border group hover:border-primary/30 transition-all duration-500">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="p-3 rounded-xl bg-background border border-border group-hover:scale-110 transition-all duration-500 shrink-0">
                <Globe className="w-6 h-6 text-primary transition-colors" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground uppercase tracking-widest italic mb-4 transition-colors">
                  01. Mục đích dự án
                </h2>
                <p className="leading-relaxed text-muted-foreground text-sm md:text-base transition-colors">
                  <strong className="text-foreground font-bold transition-colors">Scriptify (xcode.id.vn)</strong> là một nền tảng âm thanh phi lợi nhuận, được xây dựng cho mục đích học tập và nghiên cứu công nghệ. Toàn bộ kho nhạc hiện có được sử dụng làm dữ liệu mẫu (Sample Data) để minh họa cho khả năng streaming server.
                </p>
              </div>
            </div>
          </section>

          {/* Card 02: Copyright */}
          <section className="p-8 rounded-[2rem] bg-secondary/40 border border-border group hover:border-primary/30 transition-all duration-500">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="p-3 rounded-xl bg-background border border-border group-hover:scale-110 transition-all duration-500 shrink-0">
                <Copyright className="w-6 h-6 text-primary transition-colors" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground uppercase tracking-widest italic mb-4 transition-colors">
                  02. Sở hữu trí tuệ
                </h2>
                <p className="leading-relaxed text-muted-foreground text-sm md:text-base transition-colors">
                  Tất cả tài nguyên âm thanh và hình ảnh thuộc về chủ sở hữu bản quyền tương ứng. Chúng tôi không kinh doanh nội dung này. Scriptify hoạt động dựa trên nguyên tắc <span className="text-foreground italic underline decoration-primary/50 font-medium cursor-help transition-colors">Fair Use</span> cho mục đích giáo dục.
                </p>
              </div>
            </div>
          </section>

          {/* Card 03: Takedown Policy (Special focus) */}
          <section className="p-8 rounded-[2rem] bg-secondary/60 border border-primary/20 relative overflow-hidden group hover:bg-primary/5 transition-all duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldAlert className="w-32 h-32 text-primary transition-colors" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-background border border-primary/30 shrink-0 transition-colors">
                   <Gavel className="w-6 h-6 text-primary transition-colors" />
                </div>
                <h2 className="text-xl font-black text-foreground uppercase tracking-widest italic transition-colors">
                  03. Chính sách gỡ bỏ (DMCA)
                </h2>
              </div>
              <p className="text-muted-foreground mb-8 max-w-2xl text-sm md:text-base leading-relaxed transition-colors">
                Nếu bạn là tác giả và muốn nội dung của mình được gỡ bỏ khỏi hệ thống thử nghiệm này, vui lòng liên hệ qua hòm thư quản trị. Chúng tôi cam kết phản hồi và xử lý nội dung trong vòng 24-48 giờ.
              </p>
              <a 
                href="mailto:kimngoctam15@gmail.com" 
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest hover:shadow-lg hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
              >
                <Mail className="w-4 h-4" />
                Gửi yêu cầu gỡ bỏ
              </a>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 transition-colors">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 italic text-center transition-colors">
            © {currentYear} Scriptify Project // Developed by Krisaleth
          </p>
          <button 
            onClick={() => navigate("/")}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors italic group flex items-center gap-2"
          >
            Trở về trang chủ <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DisclaimerPage;