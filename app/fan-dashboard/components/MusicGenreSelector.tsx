"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth-context";
// import { createClient } from "../../../lib/supabase/client"; // Not needed for now

export function MusicGenreSelector() {
  const { user } = useAuth();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [availableGenres] = useState<string[]>([
    "Metal / Punk", "Rock", "Country", "The Blues/Jazz", 
    "Industrial Gothic", "Jamaican", "Rhythm & Blues", "Pop",
    "Electronic", "Hip Hop", "Classical", "Folk", "Reggae", "Alternative"
  ]);
  // No loading state needed - genres are hardcoded
  
  useEffect(() => {
    if (!user?.id) return;
    
    // Just load user's selected genres, don't load available genres from DB
    loadUserGenres();
  }, [user?.id]);


  const loadUserGenres = async () => {
    if (!user) return;

    try {
      console.log('MusicGenreSelector: Loading user genres from API...');
      const response = await fetch('/api/user-genres');
      const result = await response.json();

      if (result.error) {
        console.log('MusicGenreSelector: No existing genres found, starting fresh');
        setSelectedGenres([]);
        return;
      }

      if (result.data && Array.isArray(result.data)) {
        console.log('MusicGenreSelector: Loaded saved genres:', result.data);
        setSelectedGenres(result.data);
      } else {
        console.log('MusicGenreSelector: No saved genres, starting fresh');
        setSelectedGenres([]);
      }
    } catch (error) {
      console.error('Error loading user genres:', error);
      setSelectedGenres([]);
    }
  };

  const toggleGenre = async (genre: string) => {
    console.log('MusicGenreSelector: toggleGenre called for:', genre, 'user:', !!user);
    
    if (!user) return;

    const isSelected = selectedGenres.includes(genre);
    const newSelection = isSelected 
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];

    console.log('MusicGenreSelector: Updating selection from:', selectedGenres, 'to:', newSelection);
    setSelectedGenres(newSelection);
    
    // Save to database immediately
    try {
      const response = await fetch('/api/user-genres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ genres: newSelection }),
      });

      const result = await response.json();
      if (result.error) {
        console.error('MusicGenreSelector: Error saving genres:', result.error);
        // Revert the optimistic update
        setSelectedGenres(isSelected ? [...selectedGenres, genre] : selectedGenres.filter(g => g !== genre));
      } else {
        console.log('MusicGenreSelector: Successfully saved genres');
      }
    } catch (error) {
      console.error('MusicGenreSelector: Error saving genres:', error);
      // Revert the optimistic update
      setSelectedGenres(isSelected ? [...selectedGenres, genre] : selectedGenres.filter(g => g !== genre));
    }
  };


  // Remove loading check completely - always show the genres

  return (
    <div>
      <h3 className="text-white mb-2">Music Genres</h3>
      <p className="text-gray-400 text-sm mb-4">
        What music do you like listening to? Select at least three (3)
      </p>
      
      <div className="flex flex-wrap gap-3 mb-4">
        {availableGenres.map((genre) => {
          const isSelected = selectedGenres.includes(genre);
          return (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={`px-4 py-2 rounded-full border text-sm transition-all duration-200 transform ${
                isSelected
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500 text-white shadow-lg scale-105"
                  : "border-gray-500 text-gray-300 hover:border-purple-500 hover:text-white hover:scale-105"
              }`}
            >
              {isSelected && <span className="mr-1">✓</span>}
              {genre}
            </button>
          );
        })}
      </div>
      
      <div className="text-xs text-gray-400">
        Selected: {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''}
        {selectedGenres.length < 3 && (
          <span className="text-yellow-400 ml-2">
            (Select at least 3 genres)
          </span>
        )}
      </div>
    </div>
  );
}

