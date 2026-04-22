import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Shuffle, Repeat, Heart, Music2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { getResourceUrl } from '@/utils/urlHelper';
import { useState } from 'react';

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

  return (
    <footer className="h-24 bg-black border-t border-white/5 px-6 flex items-center justify-between z-50">
      {/* TRÁI: INFO */}
      <div className="flex items-center gap-4 w-[30%] min-w-0">
        <div className="w-14 h-14 bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
          {hasActiveSong ? (
            <img 
              src={getResourceUrl(currentSong.imageUrl)} 
              className="w-full h-full object-cover animate-in fade-in duration-500" 
              onError={(e) => (e.currentTarget.src = "/assets/default-cover.png")}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-800"><Music2 /></div>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-black truncate uppercase italic tracking-tighter text-white">
            {currentSong?.title || "Sẵn sàng phát nhạc"}
          </div>
          <div className="text-[10px] text-zinc-500 truncate font-bold uppercase tracking-widest">
            {currentSong?.artist?.name || "Scriptify Cloud"}
          </div>
        </div>
      </div>

      {/* GIỮA: CONTROLS */}
      <div className={`flex flex-col items-center flex-1 max-w-[600px] gap-3 ${!hasActiveSong ? 'opacity-20 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-8">
          <button onClick={props.onToggleShuffle} className={`transition ${isShuffle ? 'text-green-500' : 'text-zinc-500'}`}><Shuffle size={16}/></button>
          <button onClick={props.onPrevious} className="text-zinc-400 hover:text-white transition"><SkipBack size={24} fill="currentColor"/></button>
          <button onClick={props.onPlayPause} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition">
            {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-0.5" />}
          </button>
          <button onClick={props.onNext} className="text-zinc-400 hover:text-white transition"><SkipForward size={24} fill="currentColor"/></button>
          <button onClick={props.onToggleRepeat} className={`transition ${isRepeat ? 'text-green-500' : 'text-zinc-500'}`}><Repeat size={16}/></button>
        </div>

        <div className="flex items-center gap-3 w-full group">
          <span className="text-[9px] text-zinc-500 font-black w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={(val) => props.onSeek(val[0])}
            className="flex-1 cursor-pointer"
          />
          <span className="text-[9px] text-zinc-500 font-black w-8 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* PHẢI: VOLUME */}
      <div className="flex items-center justify-end gap-3 w-[30%] group/volume">
        <button className="text-zinc-500 hover:text-white transition">
          {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <div className="w-24">
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={(val) => props.onVolumeChange(val[0])}
          />
        </div>
      </div>
    </footer>
  );
}