import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Slider } from '../ui/slider';
import { getMusicById, getAuthorById } from '../../data/mock-data';

interface MusicPlayerProps {
  currentTrackId: number | null;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export function MusicPlayer({ currentTrackId, isPlaying, onPlayPause }: MusicPlayerProps) {
  const [progress, setProgress] = useState(33);
  const [volume, setVolume] = useState(70);

  const track = currentTrackId ? getMusicById(currentTrackId) : null;
  const author = track ? getAuthorById(track.authorid) : null;

  if (!track) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 px-4 py-3">
      <div className="flex items-center justify-between gap-4 max-w-screen-2xl mx-auto">
        {/* Currently Playing */}
        <div className="flex items-center gap-3 min-w-[180px] w-[30%]">
          <div className="w-14 h-14 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
            <img
              src={track.url}
              alt={track.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm truncate">{track.name}</p>
            <p className="text-zinc-400 text-xs truncate">{author?.authorname}</p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
          <div className="flex items-center gap-4">
            <button className="text-zinc-400 hover:text-white transition">
              <SkipBack className="w-5 h-5" fill="currentColor" />
            </button>
            <button
              onClick={onPlayPause}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-black" fill="currentColor" />
              ) : (
                <Play className="w-4 h-4 text-black ml-0.5" fill="currentColor" />
              )}
            </button>
            <button className="text-zinc-400 hover:text-white transition">
              <SkipForward className="w-5 h-5" fill="currentColor" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-zinc-400 min-w-[40px] text-right">1:23</span>
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-zinc-400 min-w-[40px]">3:45</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 min-w-[180px] w-[30%] justify-end">
          <Volume2 className="w-4 h-4 text-zinc-400" />
          <Slider
            value={[volume]}
            onValueChange={(value) => setVolume(value[0])}
            max={100}
            step={1}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
}