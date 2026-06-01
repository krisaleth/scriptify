import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Shuffle, Repeat, Music2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { getResourceUrl } from '@/utils/urlHelper';
import { cn } from "@/lib/utils";

interface MusicPlayerProps {
  currentSong: any;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  isRepeat: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (value: number) => void;
  onVolumeChange: (value: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
}

export function MusicPlayer(props: MusicPlayerProps) {
  const { currentSong, isPlaying, currentTime, duration, volume, isShuffle, isRepeat } = props;
  const hasActiveSong = !!currentSong;

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Logic chọn Icon Volume mượt mà
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={18} className="text-destructive transition-colors" />;
    if (volume < 0.5) return <Volume1 size={18} className="text-muted-foreground group-hover/volume:text-foreground transition-colors" />;
    return <Volume2 size={18} className="text-muted-foreground group-hover/volume:text-foreground transition-colors" />;
  };

  return (
    <footer className="h-24 bg-background/95 backdrop-blur-md border-t border-border px-6 flex items-center justify-between z-50 transition-colors duration-300">
      {/* TRÁI: THÔNG TIN BÀI HÁT ĐANG PHÁT */}
      <div className="flex items-center gap-4 w-[30%] min-w-0">
        <div className="w-14 h-14 bg-secondary rounded-xl overflow-hidden flex-shrink-0 border border-border shadow-lg relative group transition-colors duration-300">
          {hasActiveSong ? (
            <img 
              src={getResourceUrl(currentSong.imageUrl)} 
              className={cn(
                "w-full h-full object-cover transition-all duration-700",
                isPlaying ? "scale-110 rotate-1" : "scale-100 grayscale-[0.5]"
              )} 
              alt={currentSong.title}
              onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 bg-secondary/50">
              <Music2 className="animate-pulse" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-black truncate uppercase italic tracking-tighter text-foreground hover:text-primary transition-colors cursor-default">
            {currentSong?.title || "Scriptify Sẵn sàng"}
          </div>
          <div className="text-[10px] text-muted-foreground truncate font-bold uppercase tracking-[0.2em] mt-0.5 opacity-70 transition-colors">
            {currentSong?.artist?.name || "Chọn giai điệu của bạn"}
          </div>
        </div>
      </div>

      {/* GIỮA: TRUNG TÂM ĐIỀU KHIỂN */}
      <div className={cn(
        "flex flex-col items-center flex-1 max-w-[600px] gap-3 transition-all duration-500",
        !hasActiveSong ? 'opacity-30 pointer-events-none scale-95' : 'opacity-100'
      )}>
        <div className="flex items-center gap-8">
          
          {/* NÚT SHUFFLE (MIX BÀI) ĐÃ ĐƯỢC NÂNG CẤP */}
          <div className="relative flex flex-col items-center justify-center">
            <button 
              onClick={props.onToggleShuffle} 
              className={cn(
                "transition-all hover:scale-110 active:scale-90 p-1.5 rounded-full", 
                isShuffle ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
              title="Trộn bài"
            >
              <Shuffle size={16}/>
            </button>
            {/* Chấm tròn chỉ thị trạng thái bật */}
            {isShuffle && (
              <div className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_rgba(var(--primary),0.8)]" />
            )}
          </div>
          
          <button onClick={props.onPrevious} className="text-muted-foreground hover:text-foreground transition-all hover:scale-125 active:scale-90">
            <SkipBack size={22} fill="currentColor"/>
          </button>
          
          <button 
            onClick={props.onPlayPause} 
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-all active:scale-90 shadow-lg hover:shadow-primary/40"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          
          <button onClick={props.onNext} className="text-muted-foreground hover:text-foreground transition-all hover:scale-125 active:scale-90">
            <SkipForward size={22} fill="currentColor"/>
          </button>
          
          {/* NÚT REPEAT (LẶP LẠI) ĐÃ ĐƯỢC NÂNG CẤP */}
          <div className="relative flex flex-col items-center justify-center">
            <button 
              onClick={props.onToggleRepeat} 
              className={cn(
                "transition-all hover:scale-110 active:scale-90 p-1.5 rounded-full", 
                isRepeat ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
              title="Lặp lại"
            >
              <Repeat size={16}/>
            </button>
             {/* Chấm tròn chỉ thị trạng thái bật */}
            {isRepeat && (
              <div className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_rgba(var(--primary),0.8)]" />
            )}
          </div>

        </div>

        {/* Thanh Thời gian (Progress) */}
        <div className="flex items-center gap-3 w-full group/progress">
          <span className="text-[9px] text-muted-foreground font-black w-10 text-right tabular-nums tracking-tighter opacity-100 transition-colors">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={(val) => props.onSeek(val[0])}
            className="flex-1 cursor-pointer"
          />
          <span className="text-[9px] text-muted-foreground font-black w-10 tabular-nums tracking-tighter transition-colors">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* PHẢI: ÂM LƯỢNG & TIỆN ÍCH */}
      <div className="flex items-center justify-end gap-3 w-[30%] group/volume">
        <button 
          onClick={() => props.onVolumeChange(volume === 0 ? 0.7 : 0)} 
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          {getVolumeIcon()}
        </button>
        <div className="w-28 transition-all group-hover/volume:w-32">
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={(val) => props.onVolumeChange(val[0])}
            className="cursor-pointer"
          />
        </div>
      </div>
    </footer>
  );
}