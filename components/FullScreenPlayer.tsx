import React from 'react';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, Share2, Mic2 } from 'lucide-react';
import { Song, RepeatMode } from '../types';

interface FullScreenPlayerProps {
  song: Song;
  isPlaying: boolean;
  isFavorite: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onToggleFavorite: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onClose: () => void;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  song,
  isPlaying,
  isFavorite,
  isShuffle,
  repeatMode,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onPrev,
  onSeek,
  onToggleFavorite,
  onToggleShuffle,
  onToggleRepeat,
  onClose
}) => {
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleLyrics = () => {
    window.open(`https://genius.com/search?q=${encodeURIComponent(`${song.trackName} ${song.artistName}`)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900 flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={song.artworkUrl100.replace('100x100', '600x600')} 
          alt="" 
          className="w-full h-full object-cover blur-3xl opacity-30 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-slate-900/60 to-slate-900/90" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
        <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Now Playing</span>
        <button className="p-2 rounded-full opacity-0 cursor-default">
           <ChevronDown className="w-8 h-8" />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pb-12 gap-8 md:gap-12">
        
        {/* Artwork */}
        <div className="w-full max-w-sm md:max-w-md aspect-square relative group">
          <img 
            src={song.artworkUrl100.replace('100x100', '600x600')} 
            alt={song.trackName} 
            className={`w-full h-full rounded-2xl shadow-2xl object-cover transition-transform duration-700 ease-in-out ${isPlaying ? 'scale-100 shadow-cyan-500/20' : 'scale-90 opacity-80'}`}
          />
        </div>

        {/* Info & Main Controls Container */}
        <div className="w-full max-w-2xl flex flex-col gap-6">
          
          {/* Title & Artist */}
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white truncate mb-1">{song.trackName}</h1>
              <p className="text-lg text-slate-400 truncate font-medium">{song.artistName}</p>
            </div>
            <button 
              onClick={onToggleFavorite}
              className={`p-3 rounded-full transition-all ${isFavorite ? 'text-pink-500 bg-pink-500/10' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
               <Heart className={`w-7 h-7 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="relative h-1.5 bg-slate-700/50 rounded-full cursor-pointer group">
              <div 
                className="absolute top-0 left-0 h-full bg-cyan-400 rounded-full group-hover:bg-cyan-300 transition-all"
                style={{ width: `${(currentTime / (duration || 30)) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <input
                type="range"
                min="0"
                max={duration || 30}
                step="0.1"
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-2">
            <button 
              onClick={onToggleShuffle}
              className={`p-2 transition-colors ${isShuffle ? 'text-cyan-400 relative' : 'text-slate-400 hover:text-white'}`}
            >
              <Shuffle className="w-6 h-6" />
              {isShuffle && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full" />}
            </button>

            <div className="flex items-center gap-6">
              <button onClick={onPrev} className="text-white hover:text-cyan-400 transition-colors p-2">
                <SkipBack className="w-8 h-8 fill-current" />
              </button>
              
              <button 
                onClick={onPlayPause}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl shadow-white/10 hover:scale-105 transition-all"
              >
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </button>
              
              <button onClick={onNext} className="text-white hover:text-cyan-400 transition-colors p-2">
                <SkipForward className="w-8 h-8 fill-current" />
              </button>
            </div>

            <button 
              onClick={onToggleRepeat}
              className={`p-2 transition-colors ${repeatMode !== 'off' ? 'text-cyan-400 relative' : 'text-slate-400 hover:text-white'}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-6 h-6" /> : <Repeat className="w-6 h-6" />}
              {repeatMode !== 'off' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full" />}
            </button>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-center gap-8 mt-4">
             <button 
               onClick={handleLyrics}
               className="flex flex-col items-center gap-2 text-slate-500 hover:text-white transition-colors group"
             >
                <div className="p-3 rounded-full bg-slate-800/50 group-hover:bg-slate-700 transition-colors">
                   <Mic2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Lyrics</span>
             </button>

             <button 
               className="flex flex-col items-center gap-2 text-slate-500 hover:text-white transition-colors group"
               onClick={() => {
                 const text = `Check out "${song.trackName}" by ${song.artistName} on GrooveWave!`;
                 navigator.clipboard.writeText(text);
                 alert("Copied to clipboard!");
               }}
             >
                <div className="p-3 rounded-full bg-slate-800/50 group-hover:bg-slate-700 transition-colors">
                   <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Share</span>
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};