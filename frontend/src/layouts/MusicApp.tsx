import { Outlet } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { MusicPlayer } from "./MusicPlayer";
import { getResourceUrl } from "@/utils/urlHelper";
import { useAuthStore } from "@/store/useAuthStore";

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
        const songsList = data.content || (Array.isArray(data) ? data : []);
        setSongs(songsList);
      })
      .catch(err => console.error("Scriptify: Không thể load danh sách nhạc", err));
  }, []);

  // 2. Cập nhật bài hát hiện tại khi ID thay đổi
  useEffect(() => {
    if (currentTrackId !== null) {
      const song = songs.find(s => s.id === currentTrackId);
      if (song) {
        setCurrentSong(song);
      } else {
        fetch(`${API_BASE}/songs/${currentTrackId}`, { credentials: "include" })
          .then(res => res.json())
          .then(data => setCurrentSong(data))
          .catch(err => console.error("Scriptify: Lỗi load bài hát đơn", err));
      }
    }
  }, [currentTrackId, songs]);

  // 3. Thực hiện Play/Pause khi trạng thái hoặc Bài hát thay đổi
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      // Dùng promise để handle lỗi autoplay của trình duyệt
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Scriptify: Autoplay prevented:", error);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]); // Theo dõi cả currentSong để phát ngay khi đổi bài

  // 4. Cập nhật Volume thực tế cho thẻ Audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 5. Handle Play & Tăng View
  const handlePlayTrack = useCallback((id: number) => {
    if (currentTrackId === id) {
      setIsPlaying(prev => !prev);
    } else {
      // Khi chọn bài mới:
      setCurrentTrackId(id);
      setIsPlaying(true);
      setCurrentTime(0);

      // Ghi nhận view qua Proxy
      fetch(`${API_BASE}/songs/${id}/play`, {
        method: 'GET',
        credentials: "include",
      }).then(res => {
        if (res.ok) {
          console.log(`%cScriptify Cloud: +1 View cho ID ${id}`, "color: #22c55e; font-weight: bold");
        }
      }).catch(err => console.error("Scriptify: View counter failed", err));
    }
  }, [currentTrackId]);

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
        // "Key" thần thánh: Giúp React reset hoàn toàn thẻ audio khi đổi bài hát
        key={currentSong?.id} 
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
        onVolumeChange={setVolume}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onToggleRepeat={() => setIsRepeat(!isRepeat)}
      />
    </div>
  );
}