import { useState, useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, Volume1, VolumeX, Shuffle, Repeat, Heart 
} from 'lucide-react';
import { Slider } from '../components/ui/slider';

interface MusicPlayerProps {
  currentSong: any; // Nhận object bài hát thực tế
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (value: number) => void; // Hàm để tua nhạc
  volume: number;
  onVolumeChange: (value: number) => void;
}

const API_BASE = "http://localhost:8080/api";

export function MusicPlayer({ 
  currentSong, isPlaying, currentTime, duration, 
  onPlayPause, onNext, onPrevious, onSeek,
  volume, onVolumeChange 
}: MusicPlayerProps) {
  
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Hàm format giây thành mm:ss
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-900 px-4 py-3 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between gap-4 max-w-screen-2xl mx-auto">
        
        {/* 1. THÔNG TIN BÀI HÁT THẬT */}
        <div className="flex items-center gap-4 min-w-[180px] w-[30%]">
          <div className="w-14 h-14 bg-zinc-800 rounded overflow-hidden flex-shrink-0 shadow-lg relative group">
            <img
              src={`${API_BASE}${currentSong.imageUrl}`}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-bold truncate hover:underline cursor-pointer">
              {currentSong.title}
            </p>
            <p className="text-zinc-400 text-[11px] truncate hover:text-white cursor-pointer font-medium mt-0.5">
              {currentSong.artist?.name}
            </p>
          </div>
          <button className="text-zinc-400 hover:text-green-500 transition ml-2">
            <Heart size={16} />
          </button>
        </div>

        {/* 2. BỘ ĐIỀU KHIỂN TRUNG TÂM */}
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-2xl">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              className={`transition transform active:scale-90 ${isShuffle ? 'text-green-500' : 'text-zinc-500 hover:text-white'}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button onClick={onPrevious} className="text-zinc-400 hover:text-white transition transform active:scale-90">
              <SkipBack className="w-6 h-6" fill="currentColor" />
            </button>
            
            <button
              onClick={onPlayPause}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition shadow-xl active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black" fill="currentColor" />
              ) : (
                <Play className="w-5 h-5 text-black ml-1" fill="currentColor" />
              )}
            </button>
            
            <button onClick={onNext} className="text-zinc-400 hover:text-white transition transform active:scale-90">
              <SkipForward className="w-6 h-6" fill="currentColor" />
            </button>

            <button 
              onClick={() => setIsRepeat(!isRepeat)}
              className={`transition transform active:scale-90 ${isRepeat ? 'text-green-500' : 'text-zinc-500 hover:text-white'}`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>
          
          {/* THANH PROGRESS ĐÃ FIX LỖI LỆCH GIÂY */}
          <div className="flex items-center gap-3 w-full max-w-md">
            <span className="text-[10px] text-zinc-500 font-mono min-w-[35px] text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100} // Cực kỳ quan trọng: max phải là duration thực
              step={1}
              onValueChange={(value) => onSeek(value[0])}
              className="flex-1 cursor-pointer"
            />
            <span className="text-[10px] text-zinc-500 font-mono min-w-[35px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* 3. ĐIỀU KHIỂN ÂM LƯỢNG */}
        <div className="flex items-center gap-3 min-w-[180px] w-[30%] justify-end group">
          <button className="text-zinc-400 hover:text-white transition">
            {volume === 0 ? <VolumeX size={18} /> : volume < 50 ? <Volume1 size={18} /> : <Volume2 size={18} />}
          </button>
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={(value) => onVolumeChange(value[0])}
            className="w-24 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}