import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, Volume1, VolumeX, Shuffle, Repeat, Heart, Music2 
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface MusicPlayerProps {
  currentSong: any; // Nhận object bài hát thực tế
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (value: number) => void;
  volume: number;
  onVolumeChange: (value: number) => void;
}

const API_BASE = "http://localhost:8080/api";

// MusicPlayer.tsx

export function MusicPlayer({ 
  currentSong, isPlaying, currentTime, duration, 
  onPlayPause, onNext, onPrevious, onSeek,
  volume, onVolumeChange 
}: MusicPlayerProps) {
  
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const isPlayingRef = useRef(isPlaying);
  
  // Kiểm tra trạng thái bài hát
  const hasActiveSong = !!currentSong;

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // ... (Giữ nguyên logic useEffect devicechange của bồ) ...

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-lg border-t border-white/5 px-4 py-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between gap-4 max-w-screen-2xl mx-auto h-full">
        
        {/* 1. TRÁI: THÔNG TIN BÀI HÁT - Chống lỗi Crash khi null */}
        <div className="flex items-center gap-4 w-[30%] min-w-0">
          <div className="w-14 h-14 bg-zinc-800 rounded-md overflow-hidden flex-shrink-0 shadow-lg border border-white/5">
            {hasActiveSong ? (
              <img
                src={`${API_BASE}${currentSong?.imageUrl}`}
                alt={currentSong?.title}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = "/default-cover.png")}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700">
                <Music2 size={24} /> 
              </div>
            )}
          </div>
          <div className="overflow-hidden min-w-0 pr-2">
            <p className="text-white text-sm font-bold truncate">
              {currentSong?.title || "Chưa chọn bài hát"}
            </p>
            <p className="text-zinc-400 text-[11px] truncate font-medium mt-0.5">
              {currentSong?.artist?.name || "Scriptify Music"}
            </p>
          </div>
          {hasActiveSong && (
            <button className="text-zinc-400 hover:text-green-500 transition-colors flex-shrink-0 active:scale-90">
              <Heart size={16} />
            </button>
          )}
        </div>

        {/* 2. GIỮA: ĐIỀU KHIỂN - Vô hiệu hóa khi rỗng */}
        <div className={`flex flex-col items-center gap-2 w-[40%] max-w-[600px] ${!hasActiveSong ? 'opacity-40 select-none' : ''}`}>
          <div className={`flex items-center gap-6 ${!hasActiveSong ? 'pointer-events-none' : ''}`}>
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              className={`transition-colors active:scale-90 ${isShuffle ? 'text-green-500' : 'text-zinc-500 hover:text-white'}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button onClick={onNext} className="text-zinc-400 hover:text-white transition-all active:scale-90">
              <SkipBack className="w-6 h-6" fill="currentColor" />
            </button>
            
            <button
              onClick={onPlayPause}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 transition shadow-xl active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5 text-black" fill="currentColor" /> : <Play className="w-5 h-5 text-black ml-1" fill="currentColor" />}
            </button>
            
            <button onClick={onNext} className="text-zinc-400 hover:text-white transition-all active:scale-90">
              <SkipForward className="w-6 h-6" fill="currentColor" />
            </button>

            <button 
              onClick={() => setIsRepeat(!isRepeat)}
              className={`transition-colors active:scale-90 ${isRepeat ? 'text-green-500' : 'text-zinc-500 hover:text-white'}`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 w-full leading-none">
            <span className="text-[10px] text-zinc-500 font-mono w-10 text-right tabular-nums">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              disabled={!hasActiveSong}
              onValueChange={(value) => onSeek(value[0])}
              className="flex-1 cursor-pointer"
            />
            <span className="text-[10px] text-zinc-500 font-mono w-10 text-left tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* 3. PHẢI: ÂM LƯỢNG */}
        <div className="flex items-center justify-end gap-3 w-[30%] pr-4">
          <button className="text-zinc-400 hover:text-white transition-colors">
            {volume === 0 ? <VolumeX size={18} /> : volume < 50 ? <Volume1 size={18} /> : <Volume2 size={18} />}
          </button>
          <div className="w-24">
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(value) => onVolumeChange(value[0])}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}