import React, { useState, useEffect, useRef } from 'react';
import { Music, Search, Heart, Compass, Clock, ListMusic, Keyboard, Dices } from 'lucide-react';

interface NavbarProps {
  onSearch: (term: string) => void;
  isSearching: boolean;
  currentView: 'discover' | 'favorites' | 'playlists' | 'playlist-detail';
  onViewChange: (view: 'discover' | 'favorites' | 'playlists') => void;
  favoritesCount: number;
  onOpenShortcuts: () => void;
  onSurpriseMe?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onSearch, 
  isSearching, 
  currentView, 
  onViewChange, 
  favoritesCount,
  onOpenShortcuts,
  onSurpriseMe
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('groovewave_search_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        historyRef.current && 
        !historyRef.current.contains(event.target as Node) && 
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveHistory = (term: string) => {
    const newHistory = [term, ...history.filter(h => h !== term)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('groovewave_search_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('groovewave_search_history');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue);
      saveHistory(inputValue.trim());
      setShowHistory(false);
      inputRef.current?.blur();
    }
  };

  const handleHistoryItemClick = (term: string) => {
    setInputValue(term);
    onSearch(term);
    saveHistory(term);
    setShowHistory(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => {
              onViewChange('discover');
              setInputValue('');
            }}
          >
            <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2 rounded-lg group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="hidden sm:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              GrooveWave
            </span>
          </div>

          {/* Search Bar - Centered */}
          <div className="flex-1 max-w-xl relative">
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-4 w-4 ${isSearching ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
              </div>
              <input
                ref={inputRef}
                type="text"
                className="block w-full pl-10 pr-4 py-2 border border-slate-700 rounded-full leading-5 bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm transition-all duration-300"
                placeholder="Search songs, artists, albums..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setShowHistory(true)}
              />
            </form>

            {/* Search History Dropdown */}
            {showHistory && history.length > 0 && (
              <div 
                ref={historyRef}
                className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Searches</span>
                  <button 
                    onClick={clearHistory}
                    className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                  >
                    Clear History
                  </button>
                </div>
                <ul>
                  {history.map((term, index) => (
                    <li key={index}>
                      <button
                        className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-cyan-400 transition-colors flex items-center gap-3 group"
                        onClick={() => handleHistoryItemClick(term)}
                      >
                        <Clock className="w-4 h-4 text-slate-500 group-hover:text-cyan-500/70" />
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onViewChange('discover')}
              className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                currentView === 'discover' 
                  ? 'bg-slate-800 text-cyan-400' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              title="Discover"
            >
              <Compass className="w-5 h-5" />
              <span className="hidden lg:inline text-sm font-medium">Discover</span>
            </button>
            
            {onSurpriseMe && (
              <button
                onClick={onSurpriseMe}
                className="p-2 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-slate-800/50 transition-all duration-200"
                title="Surprise Me!"
              >
                <Dices className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => onViewChange('favorites')}
              className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-2 relative ${
                currentView === 'favorites' 
                  ? 'bg-slate-800 text-pink-400' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              title="My Library"
            >
              <Heart className={`w-5 h-5 ${currentView === 'favorites' ? 'fill-current' : ''}`} />
              <span className="hidden lg:inline text-sm font-medium">Library</span>
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
              )}
            </button>

            <button
              onClick={() => onViewChange('playlists')}
              className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-2 relative ${
                currentView === 'playlists' || currentView === 'playlist-detail'
                  ? 'bg-slate-800 text-purple-400' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              title="Playlists"
            >
              <ListMusic className="w-5 h-5" />
              <span className="hidden lg:inline text-sm font-medium">Playlists</span>
            </button>

            <div className="w-px h-6 bg-slate-700 mx-1 hidden sm:block"></div>

            <button
              onClick={onOpenShortcuts}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
              title="Keyboard Shortcuts"
            >
              <Keyboard className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};