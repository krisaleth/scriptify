import { Play, Music2, Search, Loader2, AlertCircle } from 'lucide-react';
import { authors, music } from '../../data/mock-data';
import { useState } from 'react';

interface ArtistsViewProps {
  onPlayTrack: (trackId: number) => void;
}

export function ArtistsView({ onPlayTrack }: ArtistsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter artists based on search query
  const filteredAuthors = authors.filter((author) =>
    author.authorname.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Loading artists...</p>
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
            <h3 className="text-white text-xl mb-2">Failed to load artists</h3>
            <p className="text-zinc-400 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full transition"
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
      <div className="bg-gradient-to-b from-green-900/40 to-transparent pt-8 pb-6 px-8">
        <h2 className="text-3xl text-white mb-2">Artists</h2>
        <p className="text-zinc-400">Discover your favorite musicians</p>
        
        {/* Search Bar */}
        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search for artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/60 text-white placeholder-zinc-400 rounded-full py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAuthors.map((author) => {
            const trackCount = author.musicid.length;
            const totalLikes = author.musicid.reduce((sum, musicId) => {
              const track = music.find((m) => m.id === musicId);
              return sum + (track?.like || 0);
            }, 0);

            return (
              <div
                key={author.authorid}
                className="bg-zinc-800/40 p-4 rounded-lg hover:bg-zinc-800/60 transition cursor-pointer group text-center"
              >
                <div className="relative mb-4">
                  <div className="w-full aspect-square rounded-full overflow-hidden shadow-lg mx-auto">
                    <img
                      src={author.url}
                      alt={author.authorname}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const firstTrack = music.find((m) => m.authorid === author.authorid);
                      if (firstTrack) onPlayTrack(firstTrack.id);
                    }}
                    className="absolute bottom-2 right-1/2 translate-x-1/2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:scale-105 hover:bg-green-400"
                  >
                    <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
                  </button>
                </div>
                <h4 className="text-white mb-1 truncate">{author.authorname}</h4>
                <div className="flex items-center justify-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Music2 className="w-3 h-3" />
                    {trackCount} tracks
                  </span>
                  <span>•</span>
                  <span>{totalLikes.toLocaleString()} likes</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Artists with tracks */}
        <div className="mt-12">
          <h3 className="text-2xl text-white mb-6">Popular Artists</h3>
          <div className="space-y-6">
            {filteredAuthors.slice(0, 3).map((author) => {
              const authorTracks = music.filter((m) => m.authorid === author.authorid);

              return (
                <div key={author.authorid} className="bg-zinc-900/40 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <img
                        src={author.url}
                        alt={author.authorname}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xl text-white">{author.authorname}</h4>
                      <p className="text-sm text-zinc-400">{authorTracks.length} tracks</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {authorTracks.map((track) => (
                      <div
                        key={track.id}
                        onClick={() => onPlayTrack(track.id)}
                        className="flex items-center gap-3 p-3 bg-zinc-800/40 rounded hover:bg-zinc-800/60 transition cursor-pointer group"
                      >
                        <div className="w-12 h-12 relative flex-shrink-0">
                          <img
                            src={track.url}
                            alt={track.name}
                            className="w-full h-full object-cover rounded"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition">
                            <Play className="w-4 h-4 text-white" fill="currentColor" />
                          </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-white text-sm truncate">{track.name}</p>
                          <p className="text-xs text-zinc-400">{track.like} likes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}