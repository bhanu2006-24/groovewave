import React, { useEffect, useState } from 'react';
import { ArrowLeft, Play, Pause, Heart, Plus, Share2, Disc, Calendar, Music2, Download, Mic2 } from 'lucide-react';
import { Song } from '../types';
import { searchMusic } from '../services/api';
import { SongCard } from './SongCard';

interface SongDetailProps {
  song: Song;
  isPlaying: boolean;
  isFavorite: boolean;
  onBack: () => void;
  onPlay: (song: Song) => void;
  onPause: () => void;
  onToggleFavorite: (song: Song) => void;
  onAddToPlaylist: (song: Song) => void;
  onArtistClick: (artist: string) => void;
  currentPlayingId: number | undefined;
}

export const SongDetail: React.FC<SongDetailProps> = ({
  song,
  isPlaying,
  isFavorite,
  onBack,
  onPlay,
  onPause,
  onToggleFavorite,
  onAddToPlaylist,
  onArtistClick,
  currentPlayingId
}) => {
  const [relatedSongs, setRelatedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Scroll to top when song changes
    window.scrollTo(0, 0);
    
    // Fetch related songs by artist
    const fetchRelated = async () => {
      setLoading(true);
      const results = await searchMusic(song.artistName, 0, 6);
      setRelatedSongs(results.filter(s => s.trackId !== song.trackId));
      setLoading(false);
    };

    fetchRelated();
  }, [song]);

  const handleShare = () => {
    const text = `Check out "${song.trackName}" by ${song.artistName} on GrooveWave!`;
    navigator.clipboard.writeText(text);
    alert("Song link copied to clipboard!");
  };

  const handleLyrics = () => {
    window.open(`https://genius.com/search?q=${encodeURIComponent(`${song.trackName} ${song.artistName}`)}`, '_blank');
  };

  const handleDownload = async () => {
      try {
        const response = await fetch(song.previewUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${song.trackName} - ${song.artistName}.m4a`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error("Download failed:", error);
      }
    };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Browse
      </button>

      {/* Main Content */}
      <div className="grid md:grid-cols-[400px,1fr] gap-8 lg:gap-12">
        
        {/* Album Art Section */}
        <div className="relative group">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-700/50">
             <img 
               src={song.artworkUrl100.replace('100x100', '600x600')} 
               alt={song.collectionName} 
               className="w-full h-full object-cover"
             />
             {/* Large Play Overlay */}
             <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => isPlaying && currentPlayingId === song.trackId ? onPause() : onPlay(song)}
                  className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform"
                >
                  {isPlaying && currentPlayingId === song.trackId ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 fill-current ml-1" />
                  )}
                </button>
             </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-col justify-end">
          <button 
            onClick={() => onArtistClick(song.primaryGenreName)}
            className="self-start text-cyan-400 font-bold tracking-wider uppercase text-sm mb-2 hover:underline hover:text-cyan-300 transition-colors"
          >
            {song.primaryGenreName}
          </button>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-2 leading-tight">{song.trackName}</h1>
          <p 
            onClick={() => onArtistClick(song.artistName)}
            className="text-2xl text-slate-300 hover:text-cyan-400 cursor-pointer transition-colors font-medium mb-6"
          >
            {song.artistName}
          </p>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm text-slate-400 bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
             <div className="flex items-center gap-3">
                <Disc className="w-5 h-5 text-slate-500" />
                <div>
                   <p className="text-xs uppercase tracking-wider opacity-70">Album</p>
                   <p className="text-slate-200 font-medium truncate">{song.collectionName}</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-500" />
                <div>
                   <p className="text-xs uppercase tracking-wider opacity-70">Released</p>
                   <p className="text-slate-200 font-medium">{new Date(song.releaseDate).getFullYear()}</p>
                </div>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => isPlaying && currentPlayingId === song.trackId ? onPause() : onPlay(song)}
              className="flex-1 sm:flex-none px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full font-bold transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
            >
              {isPlaying && currentPlayingId === song.trackId ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              {isPlaying && currentPlayingId === song.trackId ? "Pause" : "Play Preview"}
            </button>
            
            <button 
              onClick={() => onToggleFavorite(song)}
              className={`px-6 py-3 rounded-full border transition-all flex items-center gap-2 font-medium ${
                isFavorite 
                  ? 'bg-pink-500/10 border-pink-500/50 text-pink-500' 
                  : 'border-slate-600 text-white hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Saved' : 'Save'}
            </button>

            <button 
              onClick={() => onAddToPlaylist(song)}
              className="p-3 rounded-full border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Add to Playlist"
            >
              <Plus className="w-5 h-5" />
            </button>

             <button 
              onClick={handleDownload}
              className="p-3 rounded-full border border-slate-600 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>

             <button 
              onClick={handleLyrics}
              className="p-3 rounded-full border border-slate-600 text-slate-300 hover:text-green-400 hover:bg-slate-800 transition-colors"
              title="Lyrics"
            >
              <Mic2 className="w-5 h-5" />
            </button>

            <button 
              onClick={handleShare}
              className="p-3 rounded-full border border-slate-600 text-slate-300 hover:text-blue-400 hover:bg-slate-800 transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* More by Artist Section */}
      <div className="mt-20">
        <div className="flex items-center gap-3 mb-6">
           <Music2 className="w-6 h-6 text-cyan-500" />
           <h3 className="text-2xl font-bold text-white">More by {song.artistName}</h3>
        </div>
        
        {loading ? (
           <div className="flex gap-4">
              {[1,2,3,4].map(i => (
                 <div key={i} className="w-48 h-64 bg-slate-800 rounded-xl animate-pulse"></div>
              ))}
           </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
             {relatedSongs.map(related => (
                <SongCard
                  key={related.trackId}
                  song={related}
                  isActive={currentPlayingId === related.trackId}
                  isPlaying={isPlaying}
                  isFavorite={false} // Simple check, or pass real state if needed
                  onPlay={onPlay}
                  onPause={onPause}
                  onToggleFavorite={onToggleFavorite}
                  onAddToPlaylist={onAddToPlaylist}
                  onArtistClick={onArtistClick}
                  onInfoClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} // Just scroll up as it will load new props
                />
             ))}
          </div>
        )}
      </div>

    </div>
  );
};