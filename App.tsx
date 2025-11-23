import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SongCard } from './components/SongCard';
import { Player } from './components/Player';
import { PlaylistModal } from './components/PlaylistModal';
import { SongDetail } from './components/SongDetail';
import { ShortcutsModal } from './components/ShortcutsModal';
import { searchMusic } from './services/api';
import { Song, RepeatMode, Playlist } from './types';
import { Headphones, Radio, Heart, ListMusic, Trash2, Play, Music, Loader2, History, ArrowUp } from 'lucide-react';

const GENRES = ["Top 100", "Pop", "Hip-Hop", "Rock", "Electronic", "R&B", "Indie", "K-Pop", "Classical", "Jazz"];
const SURPRISE_TERMS = ["Summer Vibes", "Lo-Fi Study", "Workout Hype", "Acoustic Chill", "90s Hits", "Cyberpunk", "Road Trip", "Piano Ballads", "Synthwave", "Coffee Shop"];

const App: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  
  // Views
  const [currentView, setCurrentView] = useState<'discover' | 'favorites' | 'playlists' | 'playlist-detail' | 'song-detail'>('discover');
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [selectedSongDetail, setSelectedSongDetail] = useState<Song | null>(null);

  // Player
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Search & Pagination
  const [isLoading, setIsLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('Top 100'); 
  const [offset, setOffset] = useState(0);
  const LIMIT = 50; 
  
  // New Player State
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  // Modal State
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [songToAdd, setSongToAdd] = useState<Song | null>(null);

  // UI State
  const [showScrollTop, setShowScrollTop] = useState(false);

  // --- PERSISTENCE ---

  useEffect(() => {
    const savedFavs = localStorage.getItem('groovewave_favorites');
    if (savedFavs) try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    
    const savedPlaylists = localStorage.getItem('groovewave_playlists');
    if (savedPlaylists) try { setPlaylists(JSON.parse(savedPlaylists)); } catch (e) {}

    const savedRecent = localStorage.getItem('groovewave_recent');
    if (savedRecent) try { setRecentlyPlayed(JSON.parse(savedRecent)); } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('groovewave_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('groovewave_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('groovewave_recent', JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  // --- SCROLL TO TOP LOGIC ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- RECENTLY PLAYED LOGIC ---
  const addToRecentlyPlayed = (song: Song) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.trackId !== song.trackId);
      return [song, ...filtered].slice(0, 10);
    });
  };

  // --- KEYBOARD SHORTCUTS ---

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      } else if (e.code === 'Escape') {
        setIsShortcutsModalOpen(false);
        setIsPlaylistModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSong, isShuffle, repeatMode, currentView, favorites, songs, playlists, activePlaylistId]);

  // --- DATA FETCHING ---

  const fetchSongs = async (term: string, isLoadMore = false) => {
    if (isLoading || isMoreLoading) return;

    if (!isLoadMore) {
      setIsLoading(true);
      setOffset(0); 
    } else {
      setIsMoreLoading(true);
    }
    
    setError(null);

    // Smart Fetch Loop
    // The iTunes API often returns duplicates across pages.
    // We loop up to 5 times (fetching up to 250 items) to find new songs.
    let currentOffset = isLoadMore ? offset : 0;
    let songsAdded = 0;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    // Capture existing IDs *before* starting the async loop
    const existingIds = new Set(isLoadMore ? songs.map(s => s.trackId) : []);

    try {
      while (songsAdded === 0 && attempts < MAX_ATTEMPTS) {
        attempts++;
        const results = await searchMusic(term, currentOffset, LIMIT);
        
        if (results.length === 0) break; // End of results from API

        const newItems = results.filter(s => !existingIds.has(s.trackId));
        
        if (newItems.length > 0) {
          if (isLoadMore) {
            setSongs(prev => [...prev, ...newItems]);
          } else {
            setSongs(newItems);
          }
          songsAdded = newItems.length;
        }
        
        // Always advance offset for the next attempt or next user click
        currentOffset += LIMIT;
        
        // If fresh search, stop after one attempt (we don't want to loop endlessly if query is bad)
        if (!isLoadMore) break; 
      }
      
      // Update global offset state to where we ended up
      setOffset(currentOffset);

      if (!isLoadMore && songsAdded === 0) {
        setError(`No songs found for "${term}"`);
      }

    } catch (err) {
      setError("Something went wrong while fetching music.");
    } finally {
      setIsLoading(false);
      setIsMoreLoading(false);
    }
  };

  // Trigger initial fetch
  useEffect(() => {
    if (currentView === 'discover' && songs.length === 0) {
       fetchSongs(searchTerm);
    }
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentView('discover');
    fetchSongs(term, false);
  };

  const handleLoadMore = () => {
    fetchSongs(searchTerm, true);
  };

  const handleSurpriseMe = () => {
    const randomTerm = SURPRISE_TERMS[Math.floor(Math.random() * SURPRISE_TERMS.length)];
    handleSearch(randomTerm);
  };

  // --- NAVIGATION & VIEWS ---

  const openSongDetail = (song: Song) => {
    setSelectedSongDetail(song);
    setCurrentView('song-detail');
  };

  // --- PLAYLIST LOGIC ---

  const handleCreatePlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      songs: [],
      createdAt: Date.now()
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    if (songToAdd) {
      handleAddSongToPlaylist(newPlaylist.id, songToAdd);
      setIsPlaylistModalOpen(false);
      setSongToAdd(null);
    }
  };

  const handleAddSongToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        if (pl.songs.some(s => s.trackId === song.trackId)) return pl;
        return { ...pl, songs: [...pl.songs, song] };
      }
      return pl;
    }));
    setIsPlaylistModalOpen(false);
    setSongToAdd(null);
  };

  const handleDeletePlaylist = (id: string) => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      setPlaylists(prev => prev.filter(p => p.id !== id));
      if (currentView === 'playlist-detail' && activePlaylistId === id) {
        setCurrentView('playlists');
        setActivePlaylistId(null);
      }
    }
  };

  const handleRemoveFromPlaylist = (playlistId: string, trackId: number) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, songs: pl.songs.filter(s => s.trackId !== trackId) };
      }
      return pl;
    }));
  };

  const openAddToPlaylistModal = (song: Song) => {
    setSongToAdd(song);
    setIsPlaylistModalOpen(true);
  };

  const openPlaylistDetail = (id: string) => {
    setActivePlaylistId(id);
    setCurrentView('playlist-detail');
  };

  // --- PLAYER CONTROLS ---

  const toggleFavorite = (song: Song) => {
    setFavorites(prev => {
      const exists = prev.some(s => s.trackId === song.trackId);
      if (exists) {
        return prev.filter(s => s.trackId !== song.trackId);
      }
      return [...prev, song];
    });
  };

  const handlePlay = (song: Song) => {
    if (currentSong?.trackId === song.trackId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      addToRecentlyPlayed(song);
    }
  };

  const getActiveList = () => {
    if (currentView === 'favorites') return favorites;
    if (currentView === 'playlist-detail' && activePlaylistId) {
      return playlists.find(p => p.id === activePlaylistId)?.songs || [];
    }
    if (currentView === 'song-detail' && selectedSongDetail) {
       return songs; 
    }
    return songs;
  };

  const handleNext = () => {
    const list = getActiveList();
    if (!currentSong || list.length === 0) return;
    
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * list.length);
      setCurrentSong(list[randomIndex]);
      setIsPlaying(true);
      return;
    }

    const currentIndex = list.findIndex(s => s.trackId === currentSong.trackId);
    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % list.length;
    setCurrentSong(list[nextIndex]);
    setIsPlaying(true);
    addToRecentlyPlayed(list[nextIndex]);
  };

  const handlePrev = () => {
    const list = getActiveList();
    if (!currentSong || list.length === 0) return;

    if (isShuffle) {
       const randomIndex = Math.floor(Math.random() * list.length);
       setCurrentSong(list[randomIndex]);
       setIsPlaying(true);
       return;
    }

    const currentIndex = list.findIndex(s => s.trackId === currentSong.trackId);
    if (currentIndex === -1) return;

    const prevIndex = currentIndex === 0 ? list.length - 1 : currentIndex - 1;
    setCurrentSong(list[prevIndex]);
    setIsPlaying(true);
    addToRecentlyPlayed(list[prevIndex]);
  };

  const isFavorite = (id: number) => favorites.some(s => s.trackId === id);

  // --- RENDER HELPERS ---

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
          <p className="mt-4 text-slate-400 animate-pulse">Digging through the crates...</p>
        </div>
      );
    }

    // SONG DETAIL VIEW
    if (currentView === 'song-detail' && selectedSongDetail) {
      return (
        <SongDetail 
          song={selectedSongDetail}
          isPlaying={isPlaying}
          currentPlayingId={currentSong?.trackId}
          isFavorite={isFavorite(selectedSongDetail.trackId)}
          onBack={() => setCurrentView('discover')}
          onPlay={handlePlay}
          onPause={() => setIsPlaying(false)}
          onToggleFavorite={toggleFavorite}
          onAddToPlaylist={openAddToPlaylistModal}
          onArtistClick={handleSearch}
        />
      );
    }

    // PLAYLISTS VIEW
    if (currentView === 'playlists') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <ListMusic className="w-6 h-6 text-purple-400" /> My Playlists
            </h2>
            <button 
              onClick={() => { setSongToAdd(null); setIsPlaylistModalOpen(true); }}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Create New
            </button>
          </div>
          
          {playlists.length === 0 ? (
             <div className="text-center py-12 bg-slate-800/20 rounded-xl border-2 border-dashed border-slate-700">
               <ListMusic className="w-12 h-12 text-slate-600 mx-auto mb-3" />
               <p className="text-slate-400">No playlists yet. Create one to get started!</p>
             </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {playlists.map(pl => (
                <div 
                  key={pl.id}
                  onClick={() => openPlaylistDetail(pl.id)}
                  className="group bg-slate-800 p-4 rounded-xl cursor-pointer hover:bg-slate-750 transition border border-slate-700 hover:border-purple-500/50"
                >
                  <div className="aspect-square bg-slate-900 rounded-lg mb-4 overflow-hidden relative">
                    {pl.songs.length > 0 ? (
                      <div className="grid grid-cols-2 h-full w-full">
                        {pl.songs.slice(0, 4).map((s, i) => (
                          <img key={i} src={s.artworkUrl100} className="w-full h-full object-cover" alt="" />
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Music className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition" />
                  </div>
                  <h3 className="font-bold text-white truncate">{pl.name}</h3>
                  <p className="text-sm text-slate-500">{pl.songs.length} songs</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // PLAYLIST DETAIL VIEW
    if (currentView === 'playlist-detail' && activePlaylistId) {
      const playlist = playlists.find(p => p.id === activePlaylistId);
      if (!playlist) return <div>Playlist not found</div>;

      return (
        <div>
          <div className="flex flex-col md:flex-row items-end gap-6 mb-8 pb-8 border-b border-slate-800">
             <div className="w-48 h-48 bg-gradient-to-br from-purple-900 to-slate-800 rounded-lg shadow-2xl flex items-center justify-center overflow-hidden">
                {playlist.songs.length > 0 ? (
                   <img src={playlist.songs[0].artworkUrl100.replace('100x100', '400x400')} className="w-full h-full object-cover" alt="" />
                ) : (
                   <ListMusic className="w-20 h-20 text-purple-500/50" />
                )}
             </div>
             <div className="flex-1">
               <h4 className="text-sm uppercase tracking-wider font-bold text-purple-400 mb-1">Playlist</h4>
               <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">{playlist.name}</h1>
               <p className="text-slate-400 flex items-center gap-4">
                 <span>{playlist.songs.length} songs</span>
                 <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                 <span>Created {new Date(playlist.createdAt).toLocaleDateString()}</span>
               </p>
             </div>
             <div className="flex gap-3">
               <button 
                 onClick={() => playlist.songs.length > 0 && handlePlay(playlist.songs[0])}
                 className="p-4 bg-purple-500 rounded-full text-white hover:bg-purple-400 hover:scale-105 transition shadow-lg shadow-purple-900/40"
               >
                 <Play className="w-6 h-6 fill-current ml-1" />
               </button>
               <button 
                 onClick={() => handleDeletePlaylist(playlist.id)}
                 className="p-3 border border-slate-600 rounded-full text-slate-400 hover:text-red-400 hover:border-red-400 transition"
                 title="Delete Playlist"
               >
                 <Trash2 className="w-5 h-5" />
               </button>
             </div>
          </div>

          {playlist.songs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>This playlist is empty.</p>
              <button 
                onClick={() => setCurrentView('discover')}
                className="mt-4 text-purple-400 hover:text-purple-300 font-medium"
              >
                Go find some songs!
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-32">
              {playlist.songs.map((song) => (
                <div key={`${song.trackId}-${playlist.id}`} className="relative group">
                   <SongCard
                    song={song}
                    isActive={currentSong?.trackId === song.trackId}
                    isPlaying={isPlaying}
                    isFavorite={isFavorite(song.trackId)}
                    onPlay={handlePlay}
                    onPause={() => setIsPlaying(false)}
                    onToggleFavorite={toggleFavorite}
                    onAddToPlaylist={openAddToPlaylistModal}
                    onArtistClick={handleSearch}
                    onInfoClick={openSongDetail}
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRemoveFromPlaylist(playlist.id, song.trackId); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm z-30 hover:scale-110"
                    title="Remove from playlist"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // EMPTY FAVORITES
    if (currentView === 'favorites' && favorites.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-800/20">
             <Heart className="w-16 h-16 text-slate-700 mb-4" />
             <h3 className="text-xl font-bold text-slate-300">Your library is empty</h3>
             <p className="text-slate-500 mt-2 max-w-sm">Go explore and like some songs to save them here for later.</p>
             <button 
                onClick={() => setCurrentView('discover')}
                className="mt-6 px-6 py-2 bg-cyan-600 rounded-lg text-white hover:bg-cyan-500 transition shadow-lg shadow-cyan-900/20"
             >
                Start Discovering
             </button>
        </div>
      );
    }

    // ERROR
    if (error && currentView === 'discover') {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
             <Headphones className="w-16 h-16 text-slate-700 mb-4" />
             <p className="text-xl text-slate-300">{error}</p>
             <button 
                onClick={() => handleSearch('Top 100')}
                className="mt-4 px-6 py-2 bg-slate-800 rounded-lg text-cyan-400 hover:bg-slate-700 transition border border-slate-700"
             >
                Try Trending
             </button>
        </div>
      );
    }

    // LIST (Discover / Favorites)
    return (
      <div className="pb-32">
        {/* Recently Played Section (Only on Discover Home) */}
        {currentView === 'discover' && recentlyPlayed.length > 0 && searchTerm === 'Top 100' && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" /> Recently Played
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {recentlyPlayed.map(song => (
                <div 
                  key={`recent-${song.trackId}`} 
                  className="flex-shrink-0 w-32 md:w-40 snap-start group relative cursor-pointer"
                  onClick={() => openSongDetail(song)}
                >
                  <img src={song.artworkUrl100} className="w-full aspect-square rounded-lg shadow-md mb-2 object-cover group-hover:opacity-80 transition" alt="" />
                  <p className="text-sm font-medium text-white truncate">{song.trackName}</p>
                  <p className="text-xs text-slate-500 truncate">{song.artistName}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {(currentView === 'favorites' ? favorites : songs).map((song) => (
            <SongCard
              key={song.trackId}
              song={song}
              isActive={currentSong?.trackId === song.trackId}
              isPlaying={isPlaying}
              isFavorite={isFavorite(song.trackId)}
              onPlay={handlePlay}
              onPause={() => setIsPlaying(false)}
              onToggleFavorite={toggleFavorite}
              onAddToPlaylist={openAddToPlaylistModal}
              onArtistClick={handleSearch}
              onInfoClick={openSongDetail}
            />
          ))}
        </div>

        {/* Load More Button (Only for Discover) */}
        {currentView === 'discover' && songs.length > 0 && !error && (
          <div className="mt-12 text-center pb-8">
             <button
               onClick={handleLoadMore}
               disabled={isMoreLoading}
               className="px-8 py-3 bg-slate-800 hover:bg-slate-700 hover:text-cyan-400 text-slate-300 rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto border border-slate-700 hover:border-cyan-500/50 shadow-lg"
             >
               {isMoreLoading ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin" /> Loading more tunes...
                 </>
               ) : (
                 "Load More Music"
               )}
             </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-100">
      <Navbar 
        onSearch={handleSearch} 
        isSearching={isLoading} 
        currentView={currentView as any}
        onViewChange={(view) => {
          setCurrentView(view);
          setActivePlaylistId(null);
          setSelectedSongDetail(null);
        }}
        favoritesCount={favorites.length}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onSurpriseMe={handleSurpriseMe}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Genre Filters (Only visible in Discover mode) */}
        {currentView === 'discover' && (
          <div className="mb-8 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-2">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => handleSearch(genre)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                    searchTerm === genre 
                      ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-500/25' 
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Header Section (Not for playlist detail or song detail) */}
        {currentView !== 'playlist-detail' && currentView !== 'song-detail' && (
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  {currentView === 'favorites' ? (
                    <>
                      <Heart className="w-8 h-8 text-pink-500 fill-current" />
                      My Library
                    </>
                  ) : currentView === 'playlists' ? (
                    <>
                    </>
                  ) : (
                    <>
                      {searchTerm === 'Top 100' ? 'Trending Now' : `Results for "${searchTerm}"`}
                    </>
                  )}
                </h1>
                {currentView !== 'playlists' && (
                   <p className="text-slate-400">
                   {currentView === 'favorites' 
                     ? `${favorites.length} saved tracks` 
                     : `Found ${songs.length} tracks`
                   }
                 </p>
                )}
            </div>
            
            {currentView === 'discover' && (
              <div className="hidden md:flex items-center gap-2 text-cyan-500 bg-cyan-950/30 px-4 py-2 rounded-full border border-cyan-500/20">
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">Live Previews</span>
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        {renderContent()}
      </main>

      <Footer />
      
      <Player 
        currentSong={currentSong}
        isPlaying={isPlaying}
        isFavorite={currentSong ? isFavorite(currentSong.trackId) : false}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={handleNext}
        onPrev={handlePrev}
        onToggleFavorite={currentSong ? () => toggleFavorite(currentSong) : () => {}}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onToggleRepeat={() => setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off')}
        onPause={() => setIsPlaying(false)}
      />

      {/* Playlist Modal */}
      <PlaylistModal 
        isOpen={isPlaylistModalOpen}
        onClose={() => { setIsPlaylistModalOpen(false); setSongToAdd(null); }}
        playlists={playlists}
        onCreatePlaylist={handleCreatePlaylist}
        onAddToPlaylist={songToAdd ? (id) => handleAddSongToPlaylist(id, songToAdd) : () => {}}
        songToAdd={songToAdd}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal 
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Scroll To Top Button */}
      {showScrollTop && (
         <button
           onClick={scrollToTop}
           className="fixed bottom-24 right-6 p-3 bg-cyan-500 text-white rounded-full shadow-lg hover:bg-cyan-400 hover:-translate-y-1 transition-all z-40 animate-in fade-in slide-in-from-bottom-4"
           title="Scroll to Top"
         >
           <ArrowUp className="w-6 h-6" />
         </button>
      )}

    </div>
  );
};

export default App;