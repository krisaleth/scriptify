import { Outlet } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./sidebar";
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, Volume1, VolumeX, Shuffle, Repeat 
} from "lucide-react";

const API_BASE = "http://localhost:8080/api";

export default function MusicApp() {
  const [songs, setSongs] = useState<any[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // 1. Fetch danh sách nhạc ban đầu
  useEffect(() => {
    fetch(`${API_BASE}/songs?size=100`)
      .then(res => res.json())
      .then(data => setSongs(data.content || []))
      .catch(err => console.error("Lỗi kết nối Backend:", err));
  }, []);

  // 2. Đồng bộ Metadata bài hát khi đổi ID
  useEffect(() => {
    if (currentTrackId) {
      const song = songs.find(s => s.id === currentTrackId);
      if (song) {
        setCurrentSong(song);
      } else {
        fetch(`${API_BASE}/songs/${currentTrackId}`)
          .then(res => res.json())
          .then(data => setCurrentSong(data));
      }
    }
  }, [currentTrackId, songs]);

  // 3. Audio Engine: Xử lý Play/Pause thực tế
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      // Dùng promise catch để tránh lỗi trình duyệt chặn autoplay
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackId]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // --- BRAIN: HÀM ĐIỀU KHIỂN CHÍNH ---
  const handlePlayTrack = (id: number) => {
    if (currentTrackId === id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrackId(id);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const handleNext = () => {
    if (songs.length === 0) return;
    let nextIndex;
    const currentIndex = songs.findIndex(s => s.id === currentTrackId);

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else {
      nextIndex = (currentIndex + 1) % songs.length;
    }
    handlePlayTrack(songs[nextIndex].id);
  };

  const handlePrev = () => {
    if (songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === currentTrackId);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    handlePlayTrack(songs[prevIndex].id);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const formatTime = (time: number) => {
  if (!time || isNaN(time)) return "0:00";
  const totalSeconds = Math.floor(time);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white overflow-hidden font-sans select-none">
      <audio
        ref={audioRef}
        src={currentTrackId ? `${API_BASE}/songs/${currentTrackId}/play` : ""}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => isRepeat ? audioRef.current?.play() : handleNext()}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* QUAN TRỌNG: Truyền hàm handlePlayTrack trực tiếp qua props cho Sidebar */}
        <Sidebar onPlayTrack={handlePlayTrack} />
        
        <main className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-zinc-900 to-black custom-scrollbar">
          <Outlet context={{ 
            handlePlayTrack, 
            currentTrackId, 
            isPlaying, 
            allSongs: songs 
          }} />
        </main>
      </div>

      {/* FOOTER PLAYER */}
      <footer className="h-24 bg-black border-t border-zinc-900 px-4 flex items-center justify-between z-50">
        
        {/* Info Bài hát */}
        <div className="flex items-center gap-4 w-[30%] min-w-0">
          {currentSong && (
            <>
              <img 
                src={`${API_BASE}${currentSong.imageUrl}`} 
                className="w-14 h-14 object-cover rounded shadow-lg border border-zinc-800" 
                alt="cover" 
              />
              <div className="min-w-0">
                <div className="text-sm font-bold truncate hover:underline cursor-pointer">{currentSong.title}</div>
                <div className="text-[11px] text-zinc-400 truncate hover:text-white cursor-pointer">{currentSong.artist?.name}</div>
              </div>
            </>
          )}
        </div>

        {/* Cụm điều khiển trung tâm */}
        <div className="flex flex-col items-center flex-1 max-w-[600px] px-4 gap-2">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsShuffle(!isShuffle)} 
              className={`transition transform active:scale-90 ${isShuffle ? 'text-green-500' : 'text-zinc-500 hover:text-white'}`}
            >
              <Shuffle size={16} />
            </button>

            <button onClick={handlePrev} className="text-zinc-400 hover:text-white transition active:scale-90">
              <SkipBack size={22} fill="currentColor" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition active:scale-95 shadow-lg"
            >
              {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-0.5" />}
            </button>

            <button onClick={handleNext} className="text-zinc-400 hover:text-white transition active:scale-90">
              <SkipForward size={22} fill="currentColor" />
            </button>

            <button 
              onClick={() => setIsRepeat(!isRepeat)} 
              className={`transition transform active:scale-90 ${isRepeat ? 'text-green-500' : 'text-zinc-500 hover:text-white'}`}
            >
              <Repeat size={16} />
            </button>
          </div>

          {/* Thanh Tiến Độ */}
          <div className="flex items-center gap-2 w-full group">
            <span className="text-[10px] text-zinc-500 font-mono w-10 text-right">
              {formatTime(currentTime)}
            </span>
            
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="progress-slider flex-1 h-1 rounded-full appearance-none cursor-pointer bg-zinc-800"
              style={{
                // Tính toán % chính xác để vẽ màu xanh
                backgroundImage: `linear-gradient(to right, #22c55e ${(currentTime / (duration || 100)) * 100}%, transparent ${(currentTime / (duration || 100)) * 100}%)`,
              }}
            />
            
            <span className="text-[10px] text-zinc-500 font-mono w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Cụm âm lượng */}
        <div className="flex items-center justify-end gap-3 w-[30%] group/volume">
          <button onClick={() => setVolume(volume === 0 ? 0.7 : 0)} className="text-zinc-400 hover:text-white transition">
            {volume === 0 ? <VolumeX size={18} className="text-red-500" /> : volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="progress-slider w-24 h-1 rounded-full appearance-none cursor-pointer bg-zinc-800"
            style={{
              backgroundImage: `linear-gradient(to right, #22c55e ${volume * 100}%, transparent ${volume * 100}%)`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat'
            }}
          />
        </div>
      </footer>
    </div>
  );
}