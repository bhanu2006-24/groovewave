import React from 'react';
import { Play, Pause, Disc, Heart, Plus, Info } from 'lucide-react';
import { Song } from '../types';

interface SongCardProps {
  song: Song;
  isPlaying: boolean;
  isActive: boolean;
  isFavorite: boolean;
  onPlay: (song: Song) => void;
  onPause: () => void;
  onToggleFavorite: (song: Song) => void;
  onAddToPlaylist: (song: Song) => void;
  onArtistClick: (artistName: string) => void;
  onInfoClick?: (song: Song) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ 
  song, 
  isPlaying, 
  isActive, 
  isFavorite,
  onPlay, 
  onPause,
  onToggleFavorite,
  onAddToPlaylist,
  onArtistClick,
  onInfoClick
}) => {
  
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive && isPlaying) {
      onPause();
    } else {
      onPlay(song);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(song);
  };

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToPlaylist(song);
  };

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onArtistClick(song.artistName);
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInfoClick) onInfoClick(song);
  };

  return (
    <div className={`group relative bg-slate-800 rounded-xl overflow-hidden transition-all duration-300 hover:bg-slate-750 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-900/10 border ${isActive ? 'border-cyan-500/50 shadow-cyan-900/20' : 'border-slate-700/50'}`}>
      
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden group-hover:shadow-inner">
        <img 
          src={song.artworkUrl100.replace('100x100', '400x400')} 
          alt={song.collectionName} 
          className={`w-full h-full object-cover transition-transform duration-700 ${isActive && isPlaying ? 'scale-110' : 'group-hover:scale-105'}`}
        />
        
        {/* Buttons (Favorite & Add) */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-sm ${
              isFavorite ? 'bg-pink-500/20 text-pink-500' : 'bg-black/40 text-white opacity-0 group-hover:opacity-100'
            } hover:bg-pink-500 hover:text-white hover:scale-110`}
            title={isFavorite ? "Remove from Library" : "Save to Library"}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleAddToPlaylist}
            className="p-2 rounded-full backdrop-blur-md bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-purple-500 hover:scale-110 transition-all duration-200 shadow-sm"
            title="Add to Playlist"
          >
            <Plus className="w-4 h-4" />
          </button>

          {onInfoClick && (
            <button
              onClick={handleInfoClick}
              className="p-2 rounded-full backdrop-blur-md bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-cyan-500 hover:scale-110 transition-all duration-200 shadow-sm"
              title="Song Details"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Overlay with Play Button */}
        <div 
          onClick={handleAction}
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 cursor-pointer ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          <button 
            className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-cyan-400 hover:scale-110 transition-all duration-200"
          >
            {isActive && isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-4">
        <h3 className="font-semibold text-white truncate text-base leading-tight mb-1" title={song.trackName}>
          {song.trackName}
        </h3>
        <p 
          onClick={handleArtistClick}
          className="text-slate-400 text-sm truncate hover:text-cyan-400 transition-colors cursor-pointer inline-block border-b border-transparent hover:border-cyan-400/30" 
          title={`Find more by ${song.artistName}`}
        >
          {song.artistName}
        </p>
        
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
           <Disc className="w-3 h-3" />
           <span className="truncate max-w-[150px]">{song.collectionName}</span>
        </div>
      </div>
    </div>
  );
};