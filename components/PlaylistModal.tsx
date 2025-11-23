import React, { useState } from 'react';
import { X, Plus, Music, Check } from 'lucide-react';
import { Playlist, Song } from '../types';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  onCreatePlaylist: (name: string) => void;
  onAddToPlaylist: (playlistId: string) => void;
  songToAdd: Song | null;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  playlists,
  onCreatePlaylist,
  onAddToPlaylist,
  songToAdd
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen || !songToAdd) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-cyan-400" />
            Add to Playlist
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 mb-6 p-3 bg-slate-800/50 rounded-lg">
            <img src={songToAdd.artworkUrl100} alt="" className="w-12 h-12 rounded bg-slate-700" />
            <div className="min-w-0">
              <p className="font-medium text-white truncate">{songToAdd.trackName}</p>
              <p className="text-sm text-slate-400 truncate">{songToAdd.artistName}</p>
            </div>
          </div>

          <div className="space-y-2">
            {playlists.map(playlist => {
              const alreadyIn = playlist.songs.some(s => s.trackId === songToAdd.trackId);
              return (
                <button
                  key={playlist.id}
                  onClick={() => !alreadyIn && onAddToPlaylist(playlist.id)}
                  disabled={alreadyIn}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    alreadyIn 
                      ? 'bg-slate-800/30 border-slate-800 text-slate-500 cursor-default'
                      : 'bg-slate-800 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-750 text-slate-200'
                  }`}
                >
                  <span className="truncate font-medium">{playlist.name}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="opacity-60">{playlist.songs.length} songs</span>
                    {alreadyIn && <Check className="w-4 h-4 text-green-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          {playlists.length === 0 && !isCreating && (
            <div className="text-center py-8 text-slate-500">
              <p>No playlists yet.</p>
            </div>
          )}

          {isCreating ? (
            <form onSubmit={handleCreate} className="mt-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Playlist Name"
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-slate-400 mt-2 hover:text-white"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="mt-4 w-full py-3 border-2 border-dashed border-slate-700 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Create New Playlist
            </button>
          )}
        </div>
      </div>
    </div>
  );
};