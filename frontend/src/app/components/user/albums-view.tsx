import { Play, Search, Loader2, AlertCircle } from 'lucide-react';
import { albums, getMusicById, getAuthorById } from '../../data/mock-data';
import { useState } from 'react';

interface AlbumsViewProps {
  onPlayTrack: (trackId: number) => void;
  onViewAlbum: (albumId: number) => void;
}

export function AlbumsView({ onPlayTrack, onViewAlbum }: AlbumsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter albums based on search query
  const filteredAlbums = albums.filter((album) => {
    const firstTrack = getMusicById(album.musicid[0]);
    const author = firstTrack ? getAuthorById(firstTrack.authorid) : null;
    return (
      album.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Loading albums...</p>
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
            <h3 className="text-white text-xl mb-2">Failed to load albums</h3>
            <p className="text-zinc-400 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition"
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
      <div className="bg-gradient-to-b from-blue-900/40 to-transparent pt-8 pb-6 px-8">
        <h2 className="text-3xl text-white mb-2">Albums</h2>
        <p className="text-zinc-400">Browse your music collection</p>
        
        {/* Search Bar */}
        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search for albums or artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/60 text-white placeholder-zinc-400 rounded-full py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAlbums.map((album) => {
            const firstTrack = getMusicById(album.musicid[0]);
            const author = firstTrack ? getAuthorById(firstTrack.authorid) : null;

            return (
              <div
                key={album.albumid}
                className="bg-zinc-800/40 p-4 rounded-lg hover:bg-zinc-800/60 transition cursor-pointer group"
                onClick={() => onViewAlbum(album.albumid)}
              >
                <div className="relative mb-4">
                  <img
                    src={album.url}
                    alt={album.name}
                    className="w-full aspect-square object-cover rounded-md shadow-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (firstTrack) onPlayTrack(firstTrack.id);
                    }}
                    className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:scale-105 hover:bg-green-400"
                  >
                    <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
                  </button>
                </div>
                <h4 className="text-white mb-1 truncate">{album.name}</h4>
                <p className="text-sm text-zinc-400 truncate">{author?.authorname || 'Various Artists'}</p>
                <p className="text-xs text-zinc-500 mt-1">{album.musicid.length} tracks</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}