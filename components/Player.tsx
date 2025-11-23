import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat, Repeat1, Download, Share2, Clock, Maximize2, Mic2 } from 'lucide-react';
import { Song, RepeatMode } from '../types';
import { FullScreenPlayer } from './FullScreenPlayer';

interface PlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  isFavorite: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleFavorite: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onPause: () => void;
}

export const Player: React.FC<PlayerProps> = ({ 
  currentSong, 
  isPlaying, 
  isFavorite,
  isShuffle,
  repeatMode,
  onPlayPause, 
  onNext, 
  onPrev,
  onToggleFavorite,
  onToggleShuffle,
  onToggleRepeat,
  onPause
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Sleep Timer State
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [sleepTimeLeft, setSleepTimeLeft] = useState<number | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize Volume
  useEffect(() => {
    const savedVol = localStorage.getItem('groovewave_volume');
    if (savedVol) setVolume(parseFloat(savedVol));
  }, []);

  useEffect(() => {
    localStorage.setItem('groovewave_volume', volume.toString());
  }, [volume]);

  // Keyboard Shortcuts for Player-specific actions (Mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.code === 'KeyM') {
        setIsMuted(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sleep Timer Logic
  useEffect(() => {
    if (sleepTimeLeft !== null && sleepTimeLeft > 0) {
      sleepTimerRef.current = setTimeout(() => {
        setSleepTimeLeft(prev => (prev ? prev - 1 : null));
      }, 1000);
    } else if (sleepTimeLeft === 0) {
      onPause();
      setSleepTimeLeft(null);
    }
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, [sleepTimeLeft, onPause]);

  const setSleepTimer = (minutes: number | null) => {
    setSleepTimeLeft(minutes ? minutes * 60 : null);
    setShowSleepMenu(false);
  };

  // Audio Side Effects
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Playback prevented", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDragging(true);
    setCurrentTime(parseFloat(e.target.value));
  };

  const handleSeekEnd = () => {
    setIsDragging(false);
    if (audioRef.current) {
      audioRef.current.currentTime = currentTime;
    }
  };

  const handleEnded = () => {
    if (repeatMode !== 'one') {
      onNext();
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSong) return;
    try {
      const response = await fetch(currentSong.previewUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentSong.trackName} - ${currentSong.artistName}.m4a`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSong) return;
    const text = `Check out "${currentSong.trackName}" by ${currentSong.artistName} on GrooveWave!`;
    navigator.clipboard.writeText(text).then(() => {
      const btn = e.currentTarget as HTMLButtonElement;
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<span class="text-green-400 font-bold text-xs">Copied!</span>';
      setTimeout(() => btn.innerHTML = originalHTML, 2000);
    });
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <>
      {isFullScreen && (
        <FullScreenPlayer 
          song={currentSong}
          isPlaying={isPlaying}
          isFavorite={isFavorite}
          isShuffle={isShuffle}
          repeatMode={repeatMode}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={onPlayPause}
          onNext={onNext}
          onPrev={onPrev}
          onSeek={handleSeek}
          onToggleFavorite={onToggleFavorite}
          onToggleShuffle={onToggleShuffle}
          onToggleRepeat={onToggleRepeat}
          onClose={() => setIsFullScreen(false)}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 p-3 pb-safe z-50 transition-transform">
        <audio
          ref={audioRef}
          src={currentSong.previewUrl}
          loop={repeatMode === 'one'}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={handleTimeUpdate}
        />
        
        {/* Visualizer (Decoration) */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-slate-800 flex justify-center overflow-hidden">
           {isPlaying && (
              <div className="flex gap-0.5 h-4 items-end -mt-4 opacity-50">
                 {[...Array(30)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-cyan-500/50 rounded-t-sm animate-pulse" 
                      style={{ 
                        height: `${Math.random() * 100}%`,
                        animationDuration: `${0.2 + Math.random() * 0.5}s` 
                      }} 
                    />
                 ))}
              </div>
           )}
        </div>
        
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 relative">
          
          {/* Song Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div 
              className="relative group shrink-0 cursor-pointer"
              onClick={() => setIsFullScreen(true)}
            >
               <img 
                 src={currentSong.artworkUrl100.replace('100x100', '300x300')} 
                 alt="Art" 
                 className={`w-14 h-14 rounded-md shadow-lg object-cover border border-slate-700/50 transition-transform duration-500 ${isPlaying ? 'scale-100' : 'scale-95 opacity-80'}`}
               />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                 <Maximize2 className="w-6 h-6 text-white" />
               </div>
            </div>
            
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                 <h4 className="text-white font-medium truncate text-sm leading-tight cursor-default" title={currentSong.trackName}>
                   {currentSong.trackName}
                 </h4>
                 <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wide">
                   Preview
                 </span>
              </div>
              <p className="text-slate-400 text-xs truncate cursor-default">
                {currentSong.artistName}
              </p>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                 onClick={onToggleFavorite}
                 className={`hidden sm:block p-2 rounded-full transition-colors ${isFavorite ? 'text-pink-500 hover:bg-pink-500/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                 title="Favorite"
              >
                 <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              <button 
                onClick={handleShare}
                className="hidden sm:block p-2 text-slate-500 hover:text-blue-400 hover:bg-white/5 rounded-full transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button 
                onClick={handleDownload}
                className="hidden sm:block p-2 text-slate-500 hover:text-cyan-400 hover:bg-white/5 rounded-full transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center flex-1 max-w-md">
            <div className="flex items-center gap-4 mb-1">
               <button 
                  onClick={onToggleShuffle}
                  className={`transition-colors p-2 rounded-full ${isShuffle ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                  title="Shuffle"
               >
                  <Shuffle className="w-4 h-4" />
               </button>

               <button 
                  onClick={onPrev}
                  className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full" 
               >
                  <SkipBack className="w-5 h-5 fill-current" />
               </button>
               
               <button 
                  onClick={onPlayPause}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-all text-slate-900 shadow-lg shadow-white/10 hover:bg-cyan-50"
               >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
               </button>
               
               <button 
                  onClick={onNext}
                  className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full" 
               >
                  <SkipForward className="w-5 h-5 fill-current" />
               </button>

               <button 
                  onClick={onToggleRepeat}
                  className={`transition-colors p-2 rounded-full relative ${repeatMode !== 'off' ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                  title={`Repeat: ${repeatMode}`}
               >
                  {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                  {repeatMode === 'all' && <span className="absolute bottom-1 right-2 w-1 h-1 bg-cyan-400 rounded-full"></span>}
               </button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full flex items-center gap-2 text-[10px] font-mono text-slate-500">
               <span className="w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
               <div className="relative flex-1 h-1 bg-slate-800 rounded-full group cursor-pointer">
                  <div 
                     className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full group-hover:bg-cyan-400" 
                     style={{ width: `${(currentTime / (duration || 30)) * 100}%` }}
                  >
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <input
                      type="range"
                      min="0"
                      max={duration || 30}
                      step="0.1"
                      value={currentTime}
                      onChange={handleSeekChange}
                      onMouseUp={handleSeekEnd}
                      onTouchEnd={handleSeekEnd}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
               </div>
               <span className="w-8 tabular-nums">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Section: Sleep Timer & Volume */}
          <div className="hidden md:flex items-center gap-2 flex-1 justify-end min-w-[140px]">
               {/* Expand Button for Desktop */}
               <button 
                  onClick={() => setIsFullScreen(true)}
                  className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-colors mr-2"
                  title="Full Screen"
               >
                 <Maximize2 className="w-4 h-4" />
               </button>

               {/* Sleep Timer */}
               <div className="relative">
                  <button 
                    onClick={() => setShowSleepMenu(!showSleepMenu)}
                    className={`p-2 rounded-full transition-colors relative ${sleepTimeLeft !== null ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-500 hover:text-white'}`}
                    title="Sleep Timer"
                  >
                    <Clock className="w-4 h-4" />
                    {sleepTimeLeft !== null && (
                      <span className="absolute -top-1 -right-1 text-[8px] bg-slate-800 border border-slate-600 px-1 rounded-full">
                        {Math.ceil(sleepTimeLeft / 60)}m
                      </span>
                    )}
                  </button>
                  {showSleepMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
                       <div className="py-1">
                          {[5, 15, 30, 60].map(mins => (
                            <button 
                              key={mins}
                              onClick={() => setSleepTimer(mins)}
                              className="block w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white"
                            >
                              {mins} Minutes
                            </button>
                          ))}
                          <button 
                            onClick={() => setSleepTimer(null)}
                            className="block w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-slate-700 border-t border-slate-700"
                          >
                            Turn Off
                          </button>
                       </div>
                    </div>
                  )}
               </div>

               {/* Volume */}
              <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-white transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-cyan-400"
              />
          </div>
        </div>
      </div>
    </>
  );
};