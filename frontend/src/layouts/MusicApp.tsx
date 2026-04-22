import { Outlet } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./sidebar";
import { MusicPlayer } from "./music-player";
import { getResourceUrl } from "@/utils/urlHelper";
import { useAuthStore } from "@/store/useAuthStore"; // Lấy token từ store

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
  
  // Lấy token để gọi API tăng view (nếu Backend yêu cầu Auth)
  const token = useAuthStore((state) => state.token);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch(`${API_BASE}/songs?size=100`)
      .then(res => res.json())
      .then(data => setSongs(data.content || []));
  }, []);

  useEffect(() => {
    if (currentTrackId) {
      const song = songs.find(s => s.id === currentTrackId);
      if (song) setCurrentSong(song);
      else fetch(`${API_BASE}/songs/${currentTrackId}`).then(res => res.json()).then(data => setCurrentSong(data));
    }
  }, [currentTrackId, songs]);

  useEffect(() => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.play().catch(() => setIsPlaying(false)) : audioRef.current.pause();
  }, [isPlaying, currentTrackId]);

  // SỬA TẠI ĐÂY: Hàm handlePlayTrack "thần thánh"
  const handlePlayTrack = async (id: number) => {
    if (currentTrackId === id) {
      setIsPlaying(!isPlaying);
    } else {
      // 1. Cập nhật State UI trước
      setCurrentTrackId(id);
      setIsPlaying(true);
      setCurrentTime(0);

      // 2. GỌI API TĂNG VIEW (Đây chính là mảnh ghép bồ còn thiếu)
      try {
        fetch(`${API_BASE}/songs/${id}/play`, {
          method: 'GET',
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        }).then(res => {
            if(res.ok) console.log(`Scriptify: Đã ghi nhận view cho bài hát ID ${id}`);
        });
      } catch (err) {
        console.error("Lỗi gọi API tăng view:", err);
      }
    }
  };

  const handleNext = () => {
    if (songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === currentTrackId);
    let nextIndex;
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

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white overflow-hidden font-sans select-none">
      <audio
        ref={audioRef}
        // Phát trực tiếp từ R2 để nhanh, việc tăng view đã có fetch ở trên lo
        src={currentSong ? getResourceUrl(currentSong.filePath) : undefined}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => isRepeat ? audioRef.current?.play() : handleNext()}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar onPlayTrack={handlePlayTrack} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black custom-scrollbar">
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