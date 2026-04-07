import { Play, Heart, MessageCircle, Music2, Search, Loader2, AlertCircle } from 'lucide-react';
import { getUserFavourites, currentUser, getAuthorById } from '../../data/mock-data';
import { useState } from 'react';

interface FavouritesViewProps {
  onPlayTrack: (trackId: number) => void;
}

export function FavouritesView({ onPlayTrack }: FavouritesViewProps) {
  const [favouriteTracks, setFavouriteTracks] = useState(getUserFavourites(currentUser.id));
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeFavourite = (musicId: number) => {
    setFavouriteTracks((prev) => prev.filter((track) => track.id !== musicId));
  };

  // Filter favourites based on search query
  const filteredFavourites = favouriteTracks.filter((track) => {
    const author = getAuthorById(track.authorid);
    return (
      track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author?.authorname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Loading favourites...</p>
            <p className="text-zinc-400 text-sm mt-2">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32">
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md px-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-white text-xl mb-2">Failed to load favourites</h3>
            <p className="text-zinc-400 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (favouriteTracks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black pb-32">
        <Music2 className="w-20 h-20 text-zinc-700 mb-4" />
        <h2 className="text-2xl text-white mb-2">No favourites yet</h2>
        <p className="text-zinc-400">Start adding tracks to your favourites collection</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32">
      <div className="bg-gradient-to-b from-red-900/40 to-transparent pt-8 pb-6 px-8">
        <div className="flex items-center gap-4 mb-2">
          <Heart className="w-12 h-12 text-white" fill="currentColor" />
          <div>
            <h2 className="text-3xl text-white">Your Favourites</h2>
            <p className="text-zinc-400">{favouriteTracks.length} liked tracks</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search your favourites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/60 text-white placeholder-zinc-400 rounded-full py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredFavourites.map((track) => {
            const author = getAuthorById(track.authorid);

            return (
              <div
                key={track.id}
                className="bg-zinc-800/40 rounded-lg p-3 hover:bg-zinc-800/60 transition group relative"
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
                <h4 className="text-white text-sm truncate mb-1">{track.name}</h4>
                <p className="text-xs text-zinc-400 truncate mb-2">{author?.authorname}</p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-zinc-500">
                      <Heart className="w-3 h-3" />
                      {track.like}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-500">
                      <MessageCircle className="w-3 h-3" />
                      {track.comment}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFavourite(track.id)}
                    className="text-red-400 opacity-0 group-hover:opacity-100 transition hover:text-red-300"
                  >
                    <Heart className="w-4 h-4" fill="currentColor" />
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