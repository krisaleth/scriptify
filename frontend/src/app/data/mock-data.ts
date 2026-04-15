// Database schema types
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  enabled: boolean;
  verification_code?: string;
  verification_expiration?: string;
  role: string;
  created_at: string;
}

export interface Music {
  id: number;
  name: string;
  path: string;
  comment: number;
  like: number;
  authorid: number;
  url: string;
}

export interface Author {
  authorid: number;
  authorname: string;
  musicid: number[];
  url: string;
}

export interface Album {
  albumid: number;
  musicid: number[];
  url: string;
  name: string;
}

export interface Comment {
  commentid: number;
  musicid: number;
  context: string;
  userid: number;
  timestamp: string;
}

export interface Favourite {
  favid: number;
  userid: number;
  musicid: number;
}

// Mock Data
export const currentUser: User = {
  id: 1,
  username: 'alexjohnson',
  email: 'alex@example.com',
  password: '***',
  enabled: true,
  role: 'USER',
  created_at: '2026-01-15T10:00:00Z',
};

export const authors: Author[] = [
  {
    authorid: 1,
    authorname: 'The Wanderers',
    musicid: [1, 2],
    url: 'https://images.unsplash.com/photo-1631692364644-d6558eab0915?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGNvbGxlY3Rpb258ZW58MXx8fHwxNzczNzU1OTQwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    authorid: 2,
    authorname: 'Neon Lights',
    musicid: [3, 4],
    url: 'https://images.unsplash.com/photo-1689793354800-de168c0a4c9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBzdGFnZSUyMGxpZ2h0c3xlbnwxfHx8fDE3NzM3ODM5ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    authorid: 3,
    authorname: 'Smooth Collective',
    musicid: [5],
    url: 'https://images.unsplash.com/photo-1648561848326-7eb7117274c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwbXVzaWMlMjBzdHVkaW98ZW58MXx8fHwxNzczNzI0MzAyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    authorid: 4,
    authorname: 'Highway Sons',
    musicid: [6, 7],
    url: 'https://images.unsplash.com/photo-1648561848326-7eb7117274c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY291c3RpYyUyMGd1aXRhciUyMGNsb3NlJTIwdXB8ZW58MXx8fHwxNzczNzM5NDEwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    authorid: 5,
    authorname: 'Coastal Harmony',
    musicid: [8],
    url: 'https://images.unsplash.com/photo-1575426220089-9e2ef7b0c9f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwcGVyZm9ybWVyJTIwc3RhZ2V8ZW58MXx8fHwxNzczNzAyOTcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    authorid: 6,
    authorname: 'Urban Echo',
    musicid: [9],
    url: 'https://images.unsplash.com/photo-1647160494152-4c8eb24a844b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaiUyMG1peGluZyUyMG11c2ljfGVufDF8fHx8MTc3MzgxNTk1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];

export const music: Music[] = [
  {
    id: 1,
    name: 'Midnight Dreams',
    path: '/music/midnight-dreams.mp3',
    comment: 45,
    like: 1203,
    authorid: 1,
    url: 'https://images.unsplash.com/photo-1631692364644-d6558eab0915?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGNvbGxlY3Rpb258ZW58MXx8fHwxNzczNzU1OTQwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 2,
    name: 'Lost Highway',
    path: '/music/lost-highway.mp3',
    comment: 32,
    like: 987,
    authorid: 1,
    url: 'https://images.unsplash.com/photo-1631692364644-d6558eab0915?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGNvbGxlY3Rpb258ZW58MXx8fHwxNzczNzU1OTQwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 3,
    name: 'Electric Pulse',
    path: '/music/electric-pulse.mp3',
    comment: 78,
    like: 2341,
    authorid: 2,
    url: 'https://images.unsplash.com/photo-1689793354800-de168c0a4c9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBzdGFnZSUyMGxpZ2h0c3xlbnwxfHx8fDE3NzM3ODM5ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 4,
    name: 'Neon Nights',
    path: '/music/neon-nights.mp3',
    comment: 54,
    like: 1876,
    authorid: 2,
    url: 'https://images.unsplash.com/photo-1689793354800-de168c0a4c9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBzdGFnZSUyMGxpZ2h0c3xlbnwxfHx8fDE3NzM3ODM5ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 5,
    name: 'Coffee Shop Jazz',
    path: '/music/coffee-shop-jazz.mp3',
    comment: 23,
    like: 756,
    authorid: 3,
    url: 'https://images.unsplash.com/photo-1648561848326-7eb7117274c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwbXVzaWMlMjBzdHVkaW98ZW58MXx8fHwxNzczNzI0MzAyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 6,
    name: 'Desert Roads',
    path: '/music/desert-roads.mp3',
    comment: 67,
    like: 1543,
    authorid: 4,
    url: 'https://images.unsplash.com/photo-1648561848326-7eb7117274c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY291c3RpYyUyMGd1aXRhciUyMGNsb3NlJTIwdXB8ZW58MXx8fHwxNzczNzM5NDEwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 7,
    name: 'Freedom Rider',
    path: '/music/freedom-rider.mp3',
    comment: 41,
    like: 1234,
    authorid: 4,
    url: 'https://images.unsplash.com/photo-1648561848326-7eb7117274c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY291c3RpYyUyMGd1aXRhciUyMGNsb3NlJTIwdXB8ZW58MXx8fHwxNzczNzM5NDEwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 8,
    name: 'Ocean Breeze',
    path: '/music/ocean-breeze.mp3',
    comment: 89,
    like: 2987,
    authorid: 5,
    url: 'https://images.unsplash.com/photo-1575426220089-9e2ef7b0c9f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwcGVyZm9ybWVyJTIwc3RhZ2V8ZW58MXx8fHwxNzczNzAyOTcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 9,
    name: 'City Lights',
    path: '/music/city-lights.mp3',
    comment: 56,
    like: 1654,
    authorid: 6,
    url: 'https://images.unsplash.com/photo-1647160494152-4c8eb24a844b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaiUyMG1peGluZyUyMG11c2ljfGVufDF8fHx8MTc3MzgxNTk1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];

export const albums: Album[] = [
  {
    albumid: 1,
    name: 'Night Stories',
    musicid: [1, 2],
    url: 'https://images.unsplash.com/photo-1631692364644-d6558eab0915?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGNvbGxlY3Rpb258ZW58MXx8fHwxNzczNzU1OTQwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    albumid: 2,
    name: 'Synth Wave',
    musicid: [3, 4],
    url: 'https://images.unsplash.com/photo-1689793354800-de168c0a4c9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBzdGFnZSUyMGxpZ2h0c3xlbnwxfHx8fDE3NzM3ODM5ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    albumid: 3,
    name: 'Morning Brew',
    musicid: [5],
    url: 'https://images.unsplash.com/photo-1648561848326-7eb7117274c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwbXVzaWMlMjBzdHVkaW98ZW58MXx8fHwxNzczNzI0MzAyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    albumid: 4,
    name: 'Open Sky',
    musicid: [6, 7],
    url: 'https://images.unsplash.com/photo-1648561848326-7eb7117274c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY291c3RpYyUyMGd1aXRhciUyMGNsb3NlJTIwdXB8ZW58MXx8fHwxNzczNzM5NDEwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    albumid: 5,
    name: 'Waves',
    musicid: [8],
    url: 'https://images.unsplash.com/photo-1575426220089-9e2ef7b0c9f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwcGVyZm9ybWVyJTIwc3RhZ2V8ZW58MXx8fHwxNzczNzAyOTcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    albumid: 6,
    name: 'Metropolitan',
    musicid: [9],
    url: 'https://images.unsplash.com/photo-1647160494152-4c8eb24a844b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaiUyMG1peGluZyUyMG11c2ljfGVufDF8fHx8MTc3MzgxNTk1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];

export const comments: Comment[] = [
  {
    commentid: 1,
    musicid: 1,
    context: 'This track is absolutely amazing! The melody is so haunting.',
    userid: 2,
    timestamp: '2026-03-15T10:30:00Z',
  },
  {
    commentid: 2,
    musicid: 1,
    context: 'Been listening to this on repeat. Love it!',
    userid: 3,
    timestamp: '2026-03-16T14:20:00Z',
  },
  {
    commentid: 3,
    musicid: 3,
    context: 'The beat drops are incredible. Perfect for my workout playlist.',
    userid: 1,
    timestamp: '2026-03-17T08:45:00Z',
  },
  {
    commentid: 4,
    musicid: 8,
    context: 'So relaxing. Perfect for a beach day!',
    userid: 4,
    timestamp: '2026-03-18T16:00:00Z',
  },
];

export const favourites: Favourite[] = [
  { favid: 1, userid: 1, musicid: 1 },
  { favid: 2, userid: 1, musicid: 2 },
  { favid: 3, userid: 1, musicid: 3 },
  { favid: 4, userid: 1, musicid: 5 },
  { favid: 5, userid: 1, musicid: 8 },
];

// Helper functions
export function getAuthorById(authorid: number): Author | undefined {
  return authors.find((a) => a.authorid === authorid);
}

export function getMusicById(musicid: number): Music | undefined {
  return music.find((m) => m.id === musicid);
}

export function getAlbumByMusicId(musicid: number): Album | undefined {
  return albums.find((a) => a.musicid.includes(musicid));
}

export function getCommentsByMusicId(musicid: number): Comment[] {
  return comments.filter((c) => c.musicid === musicid);
}

export function isFavourite(userid: number, musicid: number): boolean {
  return favourites.some((f) => f.userid === userid && f.musicid === musicid);
}

export function getUserFavourites(userid: number): Music[] {
  const userFavs = favourites.filter((f) => f.userid === userid);
  return userFavs
    .map((f) => getMusicById(f.musicid))
    .filter((m): m is Music => m !== undefined);
}
