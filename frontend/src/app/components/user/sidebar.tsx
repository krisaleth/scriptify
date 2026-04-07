import { Home, Search, Library, Heart, User, Music2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { currentUser, getUserFavourites, albums } from '../../data/mock-data';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const favouriteTracks = getUserFavourites(currentUser.id);

  return (
    <div className="w-64 bg-black border-r border-zinc-800 flex flex-col h-full">
      {/* Login / Account Section */}
      <div className="p-6 border-b border-zinc-800">
        <Link 
          to="/login" 
          className="flex items-center gap-3 text-zinc-400 hover:text-white transition group"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-base font-medium truncate">Login / Account</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="p-6">
        <nav className="space-y-4">
          <button
            onClick={() => onViewChange('home')}
            className={`flex items-center gap-4 w-full transition ${
              currentView === 'home' ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Home className="w-6 h-6" />
            <span>Home</span>
          </button>
          <button
            onClick={() => onViewChange('category')}
            className={`flex items-center gap-4 w-full transition ${
              currentView === 'category' ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Search className="w-6 h-6" />
            <span>Category</span>
          </button>
          <button
            onClick={() => onViewChange('albums')}
            className={`flex items-center gap-4 w-full transition ${
              currentView === 'albums' ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Library className="w-6 h-6" />
            <span>Albums</span>
          </button>
          <button
            onClick={() => onViewChange('favourites')}
            className={`flex items-center gap-4 w-full transition ${
              currentView === 'favourites' ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Heart className="w-6 h-6" />
            <span>Favourites</span>
          </button>
          <button
            onClick={() => onViewChange('artists')}
            className={`flex items-center gap-4 w-full transition ${
              currentView === 'artists' ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <User className="w-6 h-6" />
            <span>Artists</span>
          </button>
        </nav>
      </div>

      {/* Quick Access - Favourites */}
      <div className="px-6 flex-1 overflow-y-auto">
        <div className="border-t border-zinc-800 pt-4">
          <h3 className="text-xs text-zinc-400 mb-3 uppercase tracking-wider">Your Favourites</h3>
          <div className="space-y-3">
            {favouriteTracks.slice(0, 5).map((track) => (
              <button
                key={track.id}
                className="block text-sm text-zinc-400 hover:text-white transition truncate w-full text-left"
              >
                <Music2 className="w-3 h-3 inline mr-2" />
                {track.name}
              </button>
            ))}
          </div>
        </div>

        {/* Albums Quick Access */}
        <div className="border-t border-zinc-800 pt-4 mt-4">
          <h3 className="text-xs text-zinc-400 mb-3 uppercase tracking-wider">Recent Albums</h3>
          <div className="space-y-3">
            {albums.slice(0, 4).map((album) => (
              <button
                key={album.albumid}
                onClick={() => onViewChange(`album-${album.albumid}`)}
                className="block text-sm text-zinc-400 hover:text-white transition truncate w-full text-left"
              >
                {album.name}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}