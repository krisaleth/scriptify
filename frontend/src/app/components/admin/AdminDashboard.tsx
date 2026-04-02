import React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

type UserRole = "USER" | "ADMIN";

export type AdminUser = {
  id: string;
  username: string;
  email: string;
  password: string;
  enabled: boolean;
  role: UserRole;
  verification_code: string | null;
  verification_expiration: string | null;
  created_at: string;
  display_name: string;
  avatar_url: string;
  updated_at: string;
};

export type AdminSong = {
  id: string;
  title: string;
  duration: number;
  file_path: string;
  view_count: number;
  album_image?: string; 
};

function initials(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() ?? "?";
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function buildMockUsers(): AdminUser[] {
  const now = new Date().toISOString();
  const avatar = (seed: string) =>
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  return [
    { id: "1", username: "alex.m", email: "alex.m@example.com", password: "hash-alex", enabled: true, role: "USER", verification_code: null, verification_expiration: null, created_at: now, display_name: "Alex Morgan", avatar_url: avatar("alex"), updated_at: now },
    { id: "2", username: "sam_admin", email: "sam@example.com", password: "hash-sam", enabled: true, role: "ADMIN", verification_code: null, verification_expiration: null, created_at: now, display_name: "Sam Rivera", avatar_url: avatar("sam"), updated_at: now },
  ];
}

function buildMockSongs(): AdminSong[] {
  return [
    { id: "s1", title: "Midnight Drive", duration: 215, file_path: "/media/tracks/midnight-drive.flac", view_count: 12403, album_image: "https://placehold.co/150x150/18181b/10b981?text=MD" },
    { id: "s2", title: "Neon Static", duration: 198, file_path: "/media/tracks/neon-static.mp3", view_count: 8821, album_image: "https://placehold.co/150x150/18181b/10b981?text=NS" },
  ];
}

const inputDarkClasses = "border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-green-500";
const selectDarkClasses = "border-zinc-700 bg-zinc-800 flex h-9 w-full rounded-md border px-3 py-1 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-green-500 disabled:cursor-not-allowed disabled:opacity-50 text-white";
const fileInputDarkClasses = "cursor-pointer border-zinc-700 bg-zinc-800 text-zinc-300 file:me-3 file:rounded-md file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white focus-visible:ring-green-500";

export function AdminDashboard() {
  const [mainTab, setMainTab] = React.useState("users");
  const [searchQuery, setSearchQuery] = React.useState("");

  const [users, setUsers] = React.useState<AdminUser[]>(buildMockUsers);
  const [songs, setSongs] = React.useState<AdminSong[]>(buildMockSongs);

  // States cho User
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draftUsername, setDraftUsername] = React.useState("");
  const [draftEmail, setDraftEmail] = React.useState("");
  const [draftPassword, setDraftPassword] = React.useState("");
  const [draftDisplayName, setDraftDisplayName] = React.useState("");
  const [draftAvatarUrl, setDraftAvatarUrl] = React.useState("");
  const [draftRole, setDraftRole] = React.useState<UserRole>("USER");
  const [draftEnabled, setDraftEnabled] = React.useState(true);
  const [userAvatarInputKey, setUserAvatarInputKey] = React.useState(0);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminUser | null>(null);

  // States cho Song
  const [songDialogOpen, setSongDialogOpen] = React.useState(false);
  const [draftSongTitle, setDraftSongTitle] = React.useState("");
  const [draftSongDuration, setDraftSongDuration] = React.useState("");
  const [draftSongPath, setDraftSongPath] = React.useState("");
  const [draftSongViews, setDraftSongViews] = React.useState("0");
  const [draftSongImage, setDraftSongImage] = React.useState(""); // State lưu ảnh Album
  const [songImageInputKey, setSongImageInputKey] = React.useState(0);
  const [songDeleteTarget, setSongDeleteTarget] = React.useState<AdminSong | null>(null);

  const q = searchQuery.trim().toLowerCase();

  const filteredUsers = React.useMemo(() => {
    if (!q) return users;
    return users.filter(
      (u) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.display_name.toLowerCase().includes(q),
    );
  }, [users, q]);

  const filteredSongs = React.useMemo(() => {
    if (!q) return songs;
    return songs.filter(
      (s) => s.title.toLowerCase().includes(q) || s.file_path.toLowerCase().includes(q),
    );
  }, [songs, q]);

  const resetUserDraft = () => {
    setDraftUsername(""); setDraftEmail(""); setDraftPassword(""); setDraftDisplayName("");
    setDraftAvatarUrl(""); setDraftRole("USER"); setDraftEnabled(true);
    setUserAvatarInputKey((k) => k + 1);
  };

  const openCreateUser = () => {
    setEditingId(null); resetUserDraft(); setEditorOpen(true);
  };

  const openEditUser = (user: AdminUser) => {
    setEditingId(user.id); setDraftUsername(user.username); setDraftEmail(user.email);
    setDraftPassword(""); setDraftDisplayName(user.display_name); setDraftAvatarUrl(user.avatar_url);
    setDraftRole(user.role); setDraftEnabled(user.enabled);
    setUserAvatarInputKey((k) => k + 1); setEditorOpen(true);
  };

  const onUserAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") setDraftAvatarUrl(reader.result); };
    reader.readAsDataURL(file);
  };

  const saveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const u = draftUsername.trim(); const em = draftEmail.trim(); const dn = draftDisplayName.trim();
    let av = draftAvatarUrl.trim();
    if (!av) av = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u)}`;
    if (!u || !em || !dn) return;
    const ts = new Date().toISOString();
    if (editingId === null) {
      if (!draftPassword) return;
      setUsers((prev) => [...prev, { id: crypto.randomUUID(), username: u, email: em, password: draftPassword, enabled: draftEnabled, role: draftRole, verification_code: null, verification_expiration: null, created_at: ts, display_name: dn, avatar_url: av, updated_at: ts }]);
    } else {
      setUsers((prev) => prev.map((row) => {
        if (row.id !== editingId) return row;
        return { ...row, username: u, email: em, password: draftPassword.trim() !== "" ? draftPassword : row.password, display_name: dn, avatar_url: av, role: draftRole, enabled: draftEnabled, updated_at: ts };
      }));
    }
    setEditorOpen(false);
  };

  const confirmDeleteUser = () => {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((x) => x.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const openSongDialog = () => {
    setDraftSongTitle(""); setDraftSongDuration(""); setDraftSongPath(""); setDraftSongViews("0"); setDraftSongImage("");
    setSongImageInputKey((k) => k + 1); setSongDialogOpen(true);
  };

  const onSongImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") setDraftSongImage(reader.result); };
    reader.readAsDataURL(file);
  };

  const saveSong = (e: React.FormEvent) => {
    e.preventDefault();
    const title = draftSongTitle.trim(); const path = draftSongPath.trim(); const dur = parseInt(draftSongDuration, 10);
    const views = parseInt(draftSongViews, 10) || 0;
    if (!title || !path || Number.isNaN(dur) || dur < 0) return;
    setSongs((prev) => [...prev, { id: crypto.randomUUID(), title, duration: dur, file_path: path, view_count: views, album_image: draftSongImage }]);
    setSongDialogOpen(false);
  };

  const confirmDeleteSong = () => {
    if (!songDeleteTarget) return;
    setSongs((prev) => prev.filter((s) => s.id !== songDeleteTarget.id));
    setSongDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-black text-white w-full space-y-6 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
          <p className="text-zinc-400 mt-1 text-sm">Manage users and music library</p>
        </div>

        <Tabs value={mainTab} onValueChange={setMainTab} className="w-full gap-6 mt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
            <TabsList className="w-full max-w-md lg:w-auto bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="users" className="flex-1 lg:flex-none data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Users</TabsTrigger>
              <TabsTrigger value="music" className="flex-1 lg:flex-none data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Music</TabsTrigger>
            </TabsList>
            <Input
              type="search"
              placeholder="Search databases…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`h-10 w-full max-w-md lg:max-w-sm ${inputDarkClasses}`}
            />
          </div>

          {/* TAB USERS */}
          <TabsContent value="users" className="mt-0 space-y-4 outline-none">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" onClick={openCreateUser} className="gap-2 bg-green-500 text-black hover:bg-green-600 font-semibold">
                <Plus className="size-4" /> Add User
              </Button>
            </div>
            <Card className="overflow-hidden shadow-sm bg-zinc-900 border-zinc-800 text-white">
              <CardHeader className="pb-3 border-b border-zinc-800">
                <CardTitle className="text-lg">Registered Users</CardTitle>
                <CardDescription className="text-zinc-400">Manage account access and roles</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-zinc-900/50">
                      <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableHead className="w-14 text-zinc-400">Avatar</TableHead>
                        <TableHead className="text-zinc-400">Username</TableHead>
                        <TableHead className="hidden md:table-cell text-zinc-400">Display Name</TableHead>
                        <TableHead className="text-zinc-400">Email</TableHead>
                        <TableHead className="text-zinc-400">Role</TableHead>
                        <TableHead className="text-zinc-400">Status</TableHead>
                        <TableHead className="w-[100px] text-right text-zinc-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                          <TableCell colSpan={7} className="text-zinc-500 h-24 text-center">No users match your search.</TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((row) => (
                          <TableRow key={row.id} className="border-zinc-800 hover:bg-zinc-800/50">
                            <TableCell>
                              <Avatar className="size-9 border border-zinc-700">
                                <AvatarImage src={row.avatar_url || undefined} alt="" />
                                <AvatarFallback className="bg-zinc-800 text-xs font-medium text-white">{initials(row.display_name || row.username)}</AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium text-zinc-200">
                              {row.username}
                              <div className="text-zinc-500 text-xs md:hidden">{row.display_name}</div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-zinc-300">{row.display_name}</TableCell>
                            <TableCell className="max-w-[180px] truncate lg:max-w-[220px] text-zinc-400">{row.email}</TableCell>
                            <TableCell>
                              {row.role === "ADMIN" ? <Badge className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20">ADMIN</Badge> : <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">USER</Badge>}
                            </TableCell>
                            <TableCell>
                              {row.enabled ? <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20">Active</Badge> : <Badge className="bg-red-500/10 text-red-400 hover:bg-red-500/20">Inactive</Badge>}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button type="button" variant="ghost" size="icon" className="me-1 hover:bg-zinc-800 text-zinc-400 hover:text-white" onClick={() => openEditUser(row)}>
                                <Pencil className="size-4" />
                              </Button>
                              <Button type="button" variant="ghost" size="icon" className="hover:bg-red-500/10 text-red-400 hover:text-red-300" onClick={() => setDeleteTarget(row)}>
                                <Trash2 className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB MUSIC */}
          <TabsContent value="music" className="mt-0 space-y-4 outline-none">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" onClick={openSongDialog} className="gap-2 bg-green-500 text-black hover:bg-green-600 font-semibold">
                <Plus className="size-4" /> Add Song
              </Button>
            </div>
            <Card className="overflow-hidden shadow-sm bg-zinc-900 border-zinc-800 text-white">
              <CardHeader className="pb-3 border-b border-zinc-800">
                <CardTitle className="text-lg">Music Library</CardTitle>
                <CardDescription className="text-zinc-400">Manage tracks, albums, and metrics</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-zinc-900/50">
                      <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                      
                        <TableHead className="w-16 text-zinc-400">Image</TableHead>
                        <TableHead className="text-zinc-400">Title</TableHead>
                        <TableHead className="w-[100px] text-zinc-400">Duration</TableHead>
                        <TableHead className="min-w-[200px] text-zinc-400">File Path</TableHead>
                        <TableHead className="w-[110px] text-right text-zinc-400">Views</TableHead>
                        <TableHead className="w-[72px] text-right text-zinc-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSongs.length === 0 ? (
                        <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                          <TableCell colSpan={6} className="text-zinc-500 h-24 text-center">No songs match your search.</TableCell>
                        </TableRow>
                      ) : (
                        filteredSongs.map((song) => (
                          <TableRow key={song.id} className="border-zinc-800 hover:bg-zinc-800/50">
                            {/* RENDER ẢNH ALBUM */}
                            <TableCell>
                              {song.album_image ? (
                                <img src={song.album_image} alt={song.title} className="w-10 h-10 rounded object-cover border border-zinc-700" />
                              ) : (
                                <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs border border-zinc-700">N/A</div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium text-zinc-200">{song.title}</TableCell>
                            <TableCell className="tabular-nums text-zinc-400">{formatDuration(song.duration)}</TableCell>
                            <TableCell className="max-w-[320px] truncate font-mono text-xs text-zinc-500">{song.file_path}</TableCell>
                            <TableCell className="text-right tabular-nums text-zinc-400">{song.view_count.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <Button type="button" variant="ghost" size="icon" className="hover:bg-red-500/10 text-red-400 hover:text-red-300" onClick={() => setSongDeleteTarget(song)}>
                                <Trash2 className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* DIALOG USER */}
        <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg bg-zinc-900 border-zinc-800 text-white">
            <form onSubmit={saveUser}>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit user" : "Add new user"}</DialogTitle>
                <DialogDescription className="text-zinc-400">Update user credentials and permissions.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="adm-username" className="text-sm font-medium text-zinc-300">Username</label>
                  <Input id="adm-username" value={draftUsername} onChange={(e) => setDraftUsername(e.target.value)} autoComplete="off" required className={inputDarkClasses} />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="adm-email" className="text-sm font-medium text-zinc-300">Email</label>
                  <Input id="adm-email" type="email" value={draftEmail} onChange={(e) => setDraftEmail(e.target.value)} autoComplete="off" required className={inputDarkClasses} />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="adm-password" className="text-sm font-medium text-zinc-300">Password</label>
                  <Input id="adm-password" type="password" value={draftPassword} onChange={(e) => setDraftPassword(e.target.value)} placeholder={editingId ? "Leave blank to keep current" : ""} autoComplete="new-password" required={editingId === null} className={inputDarkClasses} />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="adm-display-name" className="text-sm font-medium text-zinc-300">Display name</label>
                  <Input id="adm-display-name" value={draftDisplayName} onChange={(e) => setDraftDisplayName(e.target.value)} autoComplete="name" required className={inputDarkClasses} />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="adm-avatar-file" className="text-sm font-medium text-zinc-300">Upload Avatar</label>
                  <Input key={userAvatarInputKey} id="adm-avatar-file" type="file" accept="image/*" className={fileInputDarkClasses} onChange={onUserAvatarFile} />
                  {draftAvatarUrl && (
                    <div className="mt-2 flex items-center gap-3">
                      <img src={draftAvatarUrl} alt="Preview" className="h-10 w-10 rounded-full object-cover border border-zinc-700" />
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="adm-role" className="text-sm font-medium text-zinc-300">Role</label>
                  <select id="adm-role" className={selectDarkClasses} value={draftRole} onChange={(e) => setDraftRole(e.target.value as UserRole)}>
                    <option value="USER" className="bg-zinc-800 text-white">USER</option>
                    <option value="ADMIN" className="bg-zinc-800 text-white">ADMIN</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input id="adm-enabled" type="checkbox" className="size-4 rounded border-zinc-700 bg-zinc-800 accent-green-500" checked={draftEnabled} onChange={(e) => setDraftEnabled(e.target.checked)} />
                  <label htmlFor="adm-enabled" className="text-sm font-medium text-zinc-300">Account Enabled</label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditorOpen(false)} className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white">Cancel</Button>
                <Button type="submit" className="bg-green-500 text-black hover:bg-green-600 font-semibold">Save User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG SONG */}
        <Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
          <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
            <form onSubmit={saveSong}>
              <DialogHeader>
                <DialogTitle>Add New Track</DialogTitle>
                <DialogDescription className="text-zinc-400">Upload music metadata to the library.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="song-title" className="text-sm font-medium text-zinc-300">Title</label>
                  <Input id="song-title" value={draftSongTitle} onChange={(e) => setDraftSongTitle(e.target.value)} required className={inputDarkClasses} />
                </div>
                {/* UPLOAD ẢNH ALBUM */}
                <div className="grid gap-2">
                  <label htmlFor="song-image-file" className="text-sm font-medium text-zinc-300">Album Image / Cover</label>
                  <Input key={songImageInputKey} id="song-image-file" type="file" accept="image/*" className={fileInputDarkClasses} onChange={onSongImageFile} />
                  {draftSongImage && (
                    <div className="mt-2 flex items-center gap-3">
                      <img src={draftSongImage} alt="Cover Preview" className="h-16 w-16 rounded object-cover border border-zinc-700" />
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="song-duration" className="text-sm font-medium text-zinc-300">Duration (seconds)</label>
                  <Input id="song-duration" type="number" min={0} step={1} value={draftSongDuration} onChange={(e) => setDraftSongDuration(e.target.value)} required className={inputDarkClasses} />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="song-path" className="text-sm font-medium text-zinc-300">File Path / Stream URL</label>
                  <Input id="song-path" value={draftSongPath} onChange={(e) => setDraftSongPath(e.target.value)} placeholder="/media/..." required className={`font-mono text-sm ${inputDarkClasses}`} />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="song-views" className="text-sm font-medium text-zinc-300">Initial View Count</label>
                  <Input id="song-views" type="number" min={0} step={1} value={draftSongViews} onChange={(e) => setDraftSongViews(e.target.value)} className={inputDarkClasses} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSongDialogOpen(false)} className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white">Cancel</Button>
                <Button type="submit" className="bg-green-500 text-black hover:bg-green-600 font-semibold">Add Track</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG CONFIRM DELETE */}
        <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
          <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-red-400">Delete user?</DialogTitle>
              <DialogDescription className="text-zinc-400">
                {deleteTarget ? `This will permanently remove ${deleteTarget.display_name} (${deleteTarget.username}).` : null}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">Cancel</Button>
              <Button type="button" variant="destructive" onClick={confirmDeleteUser} className="bg-red-600 text-white hover:bg-red-700">Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={songDeleteTarget !== null} onOpenChange={(open) => { if (!open) setSongDeleteTarget(null); }}>
          <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-red-400">Delete track?</DialogTitle>
              <DialogDescription className="text-zinc-400">
                {songDeleteTarget ? `Remove “${songDeleteTarget.title}” from the library?` : null}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSongDeleteTarget(null)} className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">Cancel</Button>
              <Button type="button" variant="destructive" onClick={confirmDeleteSong} className="bg-red-600 text-white hover:bg-red-700">Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}