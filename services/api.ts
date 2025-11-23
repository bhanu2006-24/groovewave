import { SearchResponse, Song } from '../types';

const BASE_URL = 'https://itunes.apple.com/search';

export const searchMusic = async (term: string, offset: number = 0, limit: number = 50): Promise<Song[]> => {
  try {
    // iTunes API requires spaces to be replaced by +
    const query = term.replace(/\s+/g, '+');
    
    // We strictly respect the limit and offset passed from the controller
    // This ensures pagination aligns perfectly (0-50, 50-100, etc.)
    const url = `${BASE_URL}?term=${query}&media=music&entity=song&limit=${limit}&offset=${offset}&country=US`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data: SearchResponse = await response.json();
    
    // Filter out items without preview URLs and remove duplicates based on Name+Artist
    const seenTracks = new Set<string>();
    
    const uniqueResults = data.results.filter((song) => {
      // Must have previewUrl to be playable
      if (!song.previewUrl) return false;
      
      // Create a unique key for the song (case-insensitive)
      const uniqueKey = `${song.artistName.toLowerCase().trim()}-${song.trackName.toLowerCase().trim()}`;
      
      if (seenTracks.has(uniqueKey)) return false;
      
      seenTracks.add(uniqueKey);
      return true;
    });

    return uniqueResults;
  } catch (error) {
    console.error("Failed to fetch music:", error);
    return [];
  }
};