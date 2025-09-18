"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth-context";
import { createClient } from "../../../lib/supabase/client";

export function MusicGenreSelector() {
  const { user } = useAuth();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadGenres();
    loadUserGenres();
  }, [user]);

  const loadGenres = async () => {
    try {
      const supabase = createClient();
      const { data: genres, error } = await supabase
        .from('genres')
        .select('name')
        .order('name');

      if (error) throw error;

      if (genres) {
        setAvailableGenres(genres.map(g => g.name));
      } else {
        // Fallback genres if database is empty
        setAvailableGenres([
          "Metal / Punk",
          "Rock", 
          "Country",
          "The Blues/Jazz",
          "Industrial Gothic",
          "Jamaican",
          "Rhythm & Blues",
          "Pop",
          "Electronic",
          "Hip Hop",
          "Classical",
          "Folk",
          "Reggae",
          "Alternative"
        ]);
      }
    } catch (error) {
      console.error('Error loading genres:', error);
      // Use fallback genres
      setAvailableGenres([
        "Metal / Punk",
        "Rock", 
        "Country",
        "The Blues/Jazz",
        "Industrial Gothic",
        "Jamaican",
        "Rhythm & Blues",
        "Pop"
      ]);
    }
  };

  const loadUserGenres = async () => {
    if (!user) return;

    try {
      const supabase = createClient();
      const { data: userGenres, error } = await supabase
        .from('user_genre_preferences')
        .select(`
          genres (
            name
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      if (userGenres) {
        const genreNames = userGenres
          .map(ug => ug.genres?.name)
          .filter(Boolean) as string[];
        setSelectedGenres(genreNames);
      }
    } catch (error) {
      console.error('Error loading user genres:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = async (genre: string) => {
    if (!user) return;

    const isSelected = selectedGenres.includes(genre);
    const newSelection = isSelected 
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];

    setSelectedGenres(newSelection);

    try {
      const supabase = createClient();

      if (isSelected) {
        // Remove genre preference
        const { error } = await supabase
          .from('user_genre_preferences')
          .delete()
          .eq('user_id', user.id)
          .eq('genre_id', await getGenreId(genre));

        if (error) throw error;
      } else {
        // Add genre preference
        const genreId = await getGenreId(genre);
        if (genreId) {
          const { error } = await supabase
            .from('user_genre_preferences')
            .insert({
              user_id: user.id,
              genre_id: genreId
            });

          if (error) throw error;
        }
      }
    } catch (error) {
      console.error('Error updating genre preference:', error);
      // Revert the UI change on error
      setSelectedGenres(selectedGenres);
    }
  };

  const getGenreId = async (genreName: string): Promise<number | null> => {
    try {
      const supabase = createClient();
      const { data: genre, error } = await supabase
        .from('genres')
        .select('id')
        .eq('name', genreName)
        .single();

      if (error) throw error;
      return genre?.id || null;
    } catch (error) {
      console.error('Error getting genre ID:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <h3 className="text-white mb-2">Music Genres</h3>
        <div className="text-gray-400 text-sm">Loading genres...</div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-white mb-2">Music Genres</h3>
      <p className="text-gray-400 text-sm mb-4">
        What music do you like listening to? Select at least three (3)
      </p>
      
      <div className="flex flex-wrap gap-3 mb-4">
        {availableGenres.map((genre) => (
          <button
            key={genre}
            onClick={() => toggleGenre(genre)}
            className={`px-4 py-2 rounded-full border text-sm transition-colors ${
              selectedGenres.includes(genre)
                ? "bg-purple-600 border-purple-600 text-white"
                : "border-gray-500 text-gray-300 hover:border-purple-500 hover:text-white"
            }`}
          >
            {genre}
          </button>
        ))}
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

