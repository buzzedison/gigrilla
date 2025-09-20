"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Save, Plus, Edit2, Trash2 } from "lucide-react";

interface GenreEntry {
  id: string;
  genreFamily: string;
  genreGroup: string;
  subGenre: string;
}

interface ExistingGenre {
  id: string;
  name: string;
  genreGroup: string;
  subGenre: string;
}

export function ArtistGenresManager() {
  const [genreEntries, setGenreEntries] = useState<GenreEntry[]>([
    { id: "1", genreFamily: "", genreGroup: "", subGenre: "" },
    { id: "2", genreFamily: "", genreGroup: "", subGenre: "" },
    { id: "3", genreFamily: "", genreGroup: "", subGenre: "" },
  ]);

  const [existingGenres, setExistingGenres] = useState<ExistingGenre[]>([
    {
      id: "1",
      name: "Industrial/Gothic",
      genreGroup: "Industrial Rock",
      subGenre: "Metal"
    },
    {
      id: "2",
      name: "Industrial/Gothic",
      genreGroup: "Industrial Rock",
      subGenre: "Metal"
    }
  ]);

  const genreFamilies = [
    "Rock", "Pop", "Hip Hop", "Electronic", "Jazz", "Classical",
    "Country", "Folk", "Reggae", "Blues", "Soul", "Funk"
  ];

  const genreGroups: Record<string, string[]> = {
    "Rock": ["Alternative Rock", "Classic Rock", "Hard Rock", "Indie Rock", "Progressive Rock", "Punk Rock", "Industrial Rock"],
    "Pop": ["Dance Pop", "Synth Pop", "Teen Pop", "Adult Contemporary"],
    "Hip Hop": ["Rap", "Trap", "Conscious Hip Hop", "Gangsta Rap"],
    "Electronic": ["House", "Techno", "Trance", "Drum & Bass", "Dubstep", "Ambient"],
    "Jazz": ["Smooth Jazz", "Bebop", "Fusion", "Acid Jazz"],
    "Classical": ["Baroque", "Classical Period", "Romantic", "Modern Classical"]
  };

  const subGenres: Record<string, string[]> = {
    "Alternative Rock": ["Grunge", "Post-Grunge", "Indie Rock", "Alternative Metal"],
    "Hard Rock": ["Heavy Metal", "Thrash Metal", "Glam Metal", "Industrial Metal"],
    "Industrial Rock": ["Industrial Metal", "Gothic Metal", "Nu Metal"],
    "Rap": ["Gangsta Rap", "Conscious Rap", "Trap", "Drill"],
    "House": ["Deep House", "Tech House", "Progressive House", "Electro House"],
    "Techno": ["Minimal Techno", "Detroit Techno", "Acid Techno", "Industrial Techno"]
  };

  const updateGenreEntry = (id: string, field: keyof GenreEntry, value: string) => {
    setGenreEntries(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const addGenreEntry = () => {
    const newEntry: GenreEntry = {
      id: Date.now().toString(),
      genreFamily: "",
      genreGroup: "",
      subGenre: ""
    };
    setGenreEntries(prev => [...prev, newEntry]);
  };

  const removeGenreEntry = (id: string) => {
    setGenreEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const addGenreToList = (entry: GenreEntry) => {
    if (!entry.genreFamily || !entry.genreGroup || !entry.subGenre) return;

    const newGenre: ExistingGenre = {
      id: Date.now().toString(),
      name: `${entry.genreGroup}/${entry.subGenre}`,
      genreGroup: entry.genreGroup,
      subGenre: entry.subGenre
    };

    setExistingGenres(prev => [...prev, newGenre]);
  };

  const removeExistingGenre = (id: string) => {
    setExistingGenres(prev => prev.filter(genre => genre.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Add Genres Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Your Music Genres</h2>

        <div className="space-y-4">
          {genreEntries.map((entry, index) => (
            <div key={entry.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Genre Family
                </label>
                <Select
                  value={entry.genreFamily}
                  onValueChange={(value) => updateGenreEntry(entry.id, 'genreFamily', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Family" />
                  </SelectTrigger>
                  <SelectContent>
                    {genreFamilies.map((family) => (
                      <SelectItem key={family} value={family}>
                        {family}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Genre Group
                </label>
                <Select
                  value={entry.genreGroup}
                  onValueChange={(value) => updateGenreEntry(entry.id, 'genreGroup', value)}
                  disabled={!entry.genreFamily}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {entry.genreFamily && genreGroups[entry.genreFamily]?.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Sub-Genre
                </label>
                <Select
                  value={entry.subGenre}
                  onValueChange={(value) => updateGenreEntry(entry.id, 'subGenre', value)}
                  disabled={!entry.genreGroup}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Sub-Genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {entry.genreGroup && subGenres[entry.genreGroup]?.map((subGenre) => (
                      <SelectItem key={subGenre} value={subGenre}>
                        {subGenre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => addGenreToList(entry)}
                  disabled={!entry.genreFamily || !entry.genreGroup || !entry.subGenre}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Genre
                </Button>
                {genreEntries.length > 1 && (
                  <Button
                    onClick={() => removeGenreEntry(entry.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Button
            onClick={addGenreEntry}
            variant="outline"
            className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            + Add Genres
          </Button>
        </div>
      </div>

      {/* Existing Genres List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Artist Genres</h3>

        <div className="space-y-4">
          {existingGenres.map((genre) => (
            <div key={genre.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{genre.name}</h4>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeExistingGenre(genre.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Genre Group: </span>
                  <span className="font-medium">{genre.genreGroup}</span>
                </div>
                <div>
                  <span className="text-gray-600">Sub-Genre: </span>
                  <span className="font-medium">{genre.subGenre}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" className="px-8">
          <Save className="w-4 h-4 mr-2" />
          Save Genres
        </Button>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8">
          Publish Genres
        </Button>
      </div>
    </div>
  );
}
