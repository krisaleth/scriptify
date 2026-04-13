import { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Shuffle, 
  Repeat, 
  Heart 
} from 'lucide-react';
import { Slider } from '../components/ui/slider';

interface MusicPlayerProps {
  currentTrackId: number | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const API_BASE = "http://localhost:8080/api";

export function MusicPlayer({ currentTrackId, isPlaying, onPlayPause, onNext, onPrevious }: MusicPlayerProps) {
  const [progress, setProgress] = useState(33);
  const [volume, setVolume] = useState(70);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');

  const track = currentTrackId ? {
    id: currentTrackId,
    title: "Bài hát mẫu",
    imageUrl: "/uploads/images/default-cover.png",
    artist: { name: "Nghệ sĩ mẫu" }
  } : null;

  if (!currentTrackId) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-900 px-4 py-3 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between gap-4 max-w-screen-2xl mx-auto">
        
        {/* 1. THÔNG TIN BÀI HÁT */}
        <div className="flex items-center gap-4 min-w-[180px] w-[30%]">
          <div className="w-14 h-14 bg-zinc-800 rounded overflow-hidden flex-shrink-0 shadow-lg group relative">
            <img
              src={track?.imageUrl.startsWith('http') ? track.imageUrl : `${API_BASE}${track?.imageUrl}`}
              alt={track?.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-bold truncate hover:underline cursor-pointer">
              {track?.title}
            </p>
            <p className="text-zinc-400 text-[11px] truncate hover:text-white cursor-pointer font-medium mt-0.5">
              {track?.artist?.name}
            </p>
          </div>
          <button className="text-zinc-400 hover:text-green-500 transition ml-2">
            <Heart size={16} />
          </button>
        </div>

        {/* 2. BỘ ĐIỀU KHIỂN TRUNG TÂM */}
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-2xl">
          <div className="flex items-center gap-6">
            {/* NÚT SHUFFLE */}
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              className={`transition transform active:scale-90 ${isShuffle ? 'text-green-500' : 'text-zinc-500 hover:text-white'}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button className="text-zinc-400 hover:text-white transition transform active:scale-90">
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
            
            <button className="text-zinc-400 hover:text-white transition transform active:scale-90">
              <SkipForward className="w-6 h-6" fill="currentColor" />
            </button>

            {/* NÚT REPEAT */}
            <button 
              onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
              className={`transition transform active:scale-90 ${repeatMode !== 'none' ? 'text-green-500' : 'text-zinc-500 hover:text-white'}`}
            >
              <Repeat className="w-4 h-4" />
              {repeatMode === 'one' && <span className="absolute -top-1 -right-1 text-[8px] font-bold">1</span>}
            </button>
          </div>
          
          {/* THANH PROGRESS */}
          <div className="flex items-center gap-3 w-full max-w-md">
            <span className="text-[10px] text-zinc-500 font-mono min-w-[35px] text-right">1:23</span>
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              max={100}
              step={0.1}
              className="flex-1 cursor-pointer"
            />
            <span className="text-[10px] text-zinc-500 font-mono min-w-[35px]">3:45</span>
          </div>
        </div>

        {/* 3. ĐIỀU KHIỂN ÂM LƯỢNG */}
        <div className="flex items-center gap-3 min-w-[180px] w-[30%] justify-end group">
          <Volume2 className="w-5 h-5 text-zinc-400 group-hover:text-white transition" />
          <Slider
            value={[volume]}
            onValueChange={(value) => setVolume(value[0])}
            max={100}
            step={1}
            className="w-24 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}