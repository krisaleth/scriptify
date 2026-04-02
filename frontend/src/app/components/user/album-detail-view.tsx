import { ArrowLeft, Play, Heart } from 'lucide-react';
import { albums, getMusicById, getAuthorById } from '../../data/mock-data';

interface AlbumDetailViewProps {
  albumId: number;
  onBack: () => void;
  onPlayTrack: (trackId: number) => void;
}

export function AlbumDetailView({ albumId, onBack, onPlayTrack }: AlbumDetailViewProps) {
  const album = albums.find((a) => a.albumid === albumId);

  if (!album) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <p className="text-zinc-400">Album not found</p>
      </div>
    );
  }

  const tracks = album.musicid.map((id) => getMusicById(id)).filter((t) => t !== undefined);
  const firstTrack = tracks[0];
  const author = firstTrack ? getAuthorById(firstTrack.authorid) : null;

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32">
      {/* Album Header - Vertical Layout */}
      <div className="bg-gradient-to-b from-purple-900/60 to-transparent px-8 pt-8 pb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <div className="w-48 h-48 mb-6 shadow-2xl">
            <img
              src={album.url}
              alt={album.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <p className="text-sm text-zinc-400 mb-2">ALBUM</p>
          <h1 className="text-4xl text-white mb-3">{album.name}</h1>
          <div className="flex items-center gap-2 text-zinc-400 mb-4">
            <span className="text-white">{author?.authorname || 'Various Artists'}</span>
            <span>•</span>
            <span>{tracks.length} tracks</span>
          </div>
          <button
            onClick={() => firstTrack && onPlayTrack(firstTrack.id)}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg hover:bg-green-400"
          >
            <Play className="w-6 h-6 text-black ml-0.5" fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Tracks List - Compact */}
      <div className="px-8 mt-6">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-2">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center gap-4 px-4 py-3 bg-zinc-900/40 rounded-lg hover:bg-zinc-800/60 transition cursor-pointer group"
                onClick={() => onPlayTrack(track.id)}
              >
                <div className="w-8 flex items-center justify-center text-zinc-400 group-hover:text-white">
                  <span className="group-hover:hidden text-sm">{index + 1}</span>
                  <Play className="w-4 h-4 hidden group-hover:block" fill="currentColor" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-white truncate">{track.name}</div>
                  <div className="text-sm text-zinc-400 truncate">{author?.authorname}</div>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{track.like}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}