import { Outlet } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { MusicPlayer } from "./MusicPlayer";
import { getResourceUrl } from "@/utils/urlHelper";
import { useAuthStore } from "@/store/useAuthStore";

// ĐỔI SANG ĐƯỜNG DẪN TƯƠNG ĐỐI: Đi qua Vite Proxy
const API_BASE = "/api";

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
  
  const { user } = useAuthStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  // 1. Fetch danh sách nhạc qua Proxy
  useEffect(() => {
    fetch(`${API_BASE}/songs?size=100`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        // Handle Spring PageImpl (.content) hoặc mảng thuần
        const songsList = data.content || (Array.isArray(data) ? data : []);
        setSongs(songsList);
      })
      .catch(err => console.error("Scriptify: Không thể load danh sách nhạc", err));
  }, []);

  // 2. Cập nhật bài hát hiện tại
  useEffect(() => {
    if (currentTrackId) {
      const song = songs.find(s => s.id === currentTrackId);
      if (song) {
        setCurrentSong(song);
      } else {
        fetch(`${API_BASE}/songs/${currentTrackId}`, { credentials: "include" })
          .then(res => res.json())
          .then(data => setCurrentSong(data));
      }
    }
  }, [currentTrackId, songs]);

  // 3. Logic Play/Pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackId]);

  // 4. Handle Play & Tăng View qua Proxy
  const handlePlayTrack = useCallback(async (id: number) => {
    if (currentTrackId === id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrackId(id);
      setIsPlaying(true);
      setCurrentTime(0);

      // Ghi nhận view - Đi qua Proxy giúp BE nhận diện được User qua Cookie
      try {
        fetch(`${API_BASE}/songs/${id}/play`, {
          method: 'GET',
          credentials: "include",
        }).then(res => {
          if (res.ok) {
            console.log(`%cScriptify Cloud: +1 View cho ID ${id}`, "color: #22c55e; font-weight: bold");
          }
        });
      } catch (err) {
        console.error("Scriptify: View counter failed", err);
      }
    }
  }, [currentTrackId, isPlaying]);

  const handleNext = useCallback(() => {
    if (songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === currentTrackId);
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else {
      nextIndex = (currentIndex + 1) % songs.length;
    }
    handlePlayTrack(songs[nextIndex].id);
  }, [songs, currentTrackId, isShuffle, handlePlayTrack]);

  const handlePrev = useCallback(() => {
    if (songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === currentTrackId);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    handlePlayTrack(songs[prevIndex].id);
  }, [songs, currentTrackId, handlePlayTrack]);

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white overflow-hidden font-sans select-none tracking-tight">
      <audio
        ref={audioRef}
        // File nhạc vẫn lấy từ URLHelper (thường là link Cloudflare R2 trực tiếp)
        src={currentSong ? getResourceUrl(currentSong.filePath) : undefined}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => isRepeat ? audioRef.current?.play() : handleNext()}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar onPlayTrack={handlePlayTrack} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black custom-scrollbar border-l border-zinc-800/50">
          <Outlet context={{ handlePlayTrack, currentTrackId, isPlaying, allSongs: songs }} />
        </main>
      </div>

      <MusicPlayer 
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isShuffle={isShuffle}
        isRepeat={isRepeat}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={handleNext}
        onPrevious={handlePrev}
        onSeek={(val) => { if(audioRef.current) audioRef.current.currentTime = val; }}
        onVolumeChange={(val) => { 
          setVolume(val); 
          if(audioRef.current) audioRef.current.volume = val; 
        }}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onToggleRepeat={() => setIsRepeat(!isRepeat)}
      />
    </div>
  );
}