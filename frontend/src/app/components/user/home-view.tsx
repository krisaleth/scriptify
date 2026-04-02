import { Play, Heart, MessageCircle, Search, User, Loader2, AlertCircle } from 'lucide-react';
import { music, getAuthorById, isFavourite } from '../../data/mock-data';
import { useState, useMemo } from 'react';

interface HomeViewProps {
  onPlayTrack: (trackId: number) => void;
}

export function HomeView({ onPlayTrack }: HomeViewProps) {
  const [favourites, setFavourites] = useState<number[]>([1, 2, 3, 5, 8]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFavourite = (musicId: number) => {
    setFavourites((prev) =>
      prev.includes(musicId) ? prev.filter((id) => id !== musicId) : [...prev, musicId]
    );
  };

  // Filter music based on search query
  const filteredMusic = music.filter((track) => {
    const author = getAuthorById(track.authorid);
    return (
      track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author?.authorname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Simulate retry function
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Hàm tạo câu chào tự động theo thời gian thực
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const greeting = getGreeting();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Loading your music...</p>
            <p className="text-zinc-400 text-sm mt-2">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32">
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md px-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-white text-xl mb-2">Something went wrong</h3>
            <p className="text-zinc-400 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/40 to-transparent pt-8 pb-6 px-8">
        <h2 className="text-3xl font-bold text-white mb-2">{greeting}, Welcome to Scriptify!</h2>
        <p className="text-zinc-400">Discover and listen to your favorite tracks</p>

        {/* Search Bar */}
        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search for songs or artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/60 text-white placeholder-zinc-400 rounded-full py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Popular Tracks */}
      <div className="px-8 mb-12">
        <h3 className="text-2xl font-semibold text-white mb-6">Popular Tracks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMusic.slice(0, 6).map((track) => {
            const author = getAuthorById(track.authorid);
            const isFav = favourites.includes(track.id);
            
            return (
              <div
                key={track.id}
                className="bg-zinc-800/40 rounded-lg p-4 hover:bg-zinc-800/60 transition group flex gap-4"
              >
                <div className="relative w-16 h-16 flex-shrink-0">
                  <img
                    src={track.url}
                    alt={track.name}
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    onClick={() => onPlayTrack(track.id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Play className="w-6 h-6 text-white" fill="currentColor" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-white font-medium truncate">{track.name}</h4>
                  <p className="text-sm text-zinc-400 truncate">{author?.authorname}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                    <button
                      onClick={() => toggleFavourite(track.id)}
                      className={`flex items-center gap-1 hover:text-red-400 transition ${
                        isFav ? 'text-red-400' : ''
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
                      <span>{track.like}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Tracks */}
      <div className="px-8">
        <h3 className="text-2xl font-semibold text-white mb-6">All Tracks</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMusic.map((track) => {
            const author = getAuthorById(track.authorid);
            const isFav = favourites.includes(track.id);
            
            return (
              <div
                key={track.id}
                className="bg-zinc-800/40 rounded-lg p-3 hover:bg-zinc-800/60 transition group"
              >
                <div className="relative mb-3">
                  <img
                    src={track.url}
                    alt={track.name}
                    className="w-full aspect-square object-cover rounded"
                  />
                  <button
                    onClick={() => onPlayTrack(track.id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition rounded"
                  >
                    <Play className="w-8 h-8 text-white" fill="currentColor" />
                  </button>
                </div>
                <h4 className="text-white font-medium text-sm truncate mb-1">{track.name}</h4>
                <p className="text-xs text-zinc-400 truncate mb-2">{author?.authorname}</p>
                <div className="flex items-center gap-3 text-xs">
                  <button
                    onClick={() => toggleFavourite(track.id)}
                    className={`flex items-center gap-1 hover:text-red-400 transition ${
                      isFav ? 'text-red-400' : 'text-zinc-500'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
                    <span>{track.like}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}