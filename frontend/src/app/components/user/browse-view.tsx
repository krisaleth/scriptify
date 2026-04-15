import { Play, Heart, MessageCircle, ArrowLeft, Search, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { music, getAuthorById, getCommentsByMusicId, comments as allComments, currentUser } from '../../data/mock-data';

interface CategoryViewProps {
  onPlayTrack: (trackId: number) => void;
}

export function CategoryView({ onPlayTrack }: CategoryViewProps) {
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const track = selectedTrack ? music.find((m) => m.id === selectedTrack) : null;
  const author = track ? getAuthorById(track.authorid) : null;
  const trackComments = track ? getCommentsByMusicId(track.id) : [];

  // Filter music based on search query
  const filteredMusic = music.filter((track) => {
    const author = getAuthorById(track.authorid);
    return (
      track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author?.authorname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      // In a real app, this would add to the database
      setNewComment('');
    }
  };

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
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Loading category...</p>
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
            <h3 className="text-white text-xl mb-2">Failed to load category</h3>
            <p className="text-zinc-400 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedTrack && track) {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32">
        <div className="bg-gradient-to-b from-indigo-900/40 to-transparent px-8 pt-8 pb-12">
          <button
            onClick={() => setSelectedTrack(null)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Category</span>
          </button>

          <div className="flex gap-8 items-end">
            <div className="w-56 h-56 flex-shrink-0 shadow-2xl">
              <img
                src={track.url}
                alt={track.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <p className="text-sm text-zinc-400 mb-2">TRACK</p>
              <h1 className="text-5xl text-white mb-4">{track.name}</h1>
              <p className="text-xl text-zinc-400 mb-4">{author?.authorname}</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Heart className="w-5 h-5" />
                  <span>{track.like} likes</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <MessageCircle className="w-5 h-5" />
                  <span>{track.comment} comments</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8">
          <button
            onClick={() => onPlayTrack(track.id)}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg hover:bg-green-400 mb-8"
          >
            <Play className="w-6 h-6 text-black ml-0.5" fill="currentColor" />
          </button>

          {/* Comments Section */}
          <div className="max-w-3xl">
            <h3 className="text-2xl text-white mb-6">Comments ({trackComments.length})</h3>
            
            {/* Add Comment */}
            <div className="bg-zinc-900/40 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="mt-2 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {trackComments.map((comment) => (
                <div key={comment.commentid} className="bg-zinc-900/40 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white">User {comment.userid}</span>
                        <span className="text-xs text-zinc-500">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-zinc-300">{comment.context}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32">
      <div className="bg-gradient-to-b from-indigo-900/40 to-transparent pt-8 pb-6 px-8">
        <h2 className="text-3xl text-white mb-2">Category</h2>
        <p className="text-zinc-400">Explore tracks and read comments</p>
        
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

      <div className="px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMusic.map((track) => {
            const author = getAuthorById(track.authorid);

            return (
              <div
                key={track.id}
                onClick={() => setSelectedTrack(track.id)}
                className="bg-zinc-800/40 p-4 rounded-lg hover:bg-zinc-800/60 transition cursor-pointer group"
              >
                <div className="relative mb-4">
                  <img
                    src={track.url}
                    alt={track.name}
                    className="w-full aspect-square object-cover rounded-md shadow-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayTrack(track.id);
                    }}
                    className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:scale-105 hover:bg-green-400"
                  >
                    <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
                  </button>
                </div>
                <h4 className="text-white mb-1 truncate">{track.name}</h4>
                <p className="text-sm text-zinc-400 truncate mb-2">{author?.authorname}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {track.like}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {track.comment}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}