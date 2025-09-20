'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Radio, Music, Mic, Headphones, Users, Palette } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

interface ArtistType {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  options: { label: string; value: string; description: string }[];
}

export function ArtistTypeSelector() {
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');

  const artistTypes: ArtistType[] = [
    {
      id: 1,
      title: "Recording Artist",
      icon: <Music className="w-5 h-5" />,
      description: "Recording Artists record their own Music and perform Live Gigs to earn a living. These members can sell their own Music tracks and book Live Gigs through Gigrilla.",
      options: [
        { label: "Singer-Songwriter", value: "singer-songwriter", description: "Writes and performs original music" },
        { label: "Solo Artist", value: "solo-artist", description: "Performs as a single artist" },
        { label: "Duo", value: "duo", description: "Two-person musical collaboration" },
        { label: "Band", value: "band", description: "Full band with multiple members" },
        { label: "Group", value: "group", description: "Larger ensemble or collective" }
      ]
    },
    {
      id: 2,
      title: "Cover Artist",
      icon: <Mic className="w-5 h-5" />,
      description: "Cover Artists don't record their own Music, but perform Live Cover DJ Set Gigs to earn a living. These members cannot sell their own Music tracks and book Live Gigs through Gigrilla.",
      options: [
        { label: "Solo Artist", value: "cover-solo", description: "Solo cover performance" },
        { label: "Duo", value: "cover-duo", description: "Two-person cover act" },
        { label: "Band", value: "cover-band", description: "Cover band with multiple members" },
        { label: "Group", value: "cover-group", description: "Larger cover ensemble" }
      ]
    },
    {
      id: 3,
      title: "DJ-Producer",
      icon: <Headphones className="w-5 h-5" />,
      description: "DJ-Producer members can record their own Music and perform Live DJ Set Gigs to earn a living. These members can sell their own Music tracks and book Live Gigs through Gigrilla.",
      options: [
        { label: "Solo Artist", value: "dj-solo", description: "Individual DJ performance" },
        { label: "Duo", value: "dj-duo", description: "Two DJ collaboration" },
        { label: "Group", value: "dj-group", description: "DJ collective or crew" }
      ]
    },
    {
      id: 4,
      title: "DJ-Entertainer",
      icon: <Users className="w-5 h-5" />,
      description: "DJ-Entertainers don't record their own Music, but perform Live Cover DJ Set Gigs to earn a living. These members cannot sell any Music tracks and book Live Gigs through Gigrilla.",
      options: [
        { label: "Solo Artist", value: "entertainer-solo", description: "Individual entertainer" },
        { label: "Duo", value: "entertainer-duo", description: "Entertainment duo" },
        { label: "Group", value: "entertainer-group", description: "Entertainment group" }
      ]
    },
    {
      id: 5,
      title: "Singer/Vocalist",
      icon: <Mic className="w-5 h-5" />,
      description: "Singers/Vocalists are looking for work, offering their skills as session singers, recording artists, and looking for opportunities to feature on Recording Artists tracks or join an Artist as a Recording Artist. They can offer their services, while also being invited to collaborate, with all terms agreed between both parties before anything is booked.",
      options: [
        { label: "Session Singer", value: "session-singer", description: "Professional studio vocalist" },
        { label: "Recording Artist", value: "recording-vocalist", description: "Recording and performing vocalist" },
        { label: "Live Performer", value: "live-vocalist", description: "Live performance vocalist" }
      ]
    },
    {
      id: 6,
      title: "Musician",
      icon: <Music className="w-5 h-5" />,
      description: "Musicians are looking for work, offering their skills as session musicians, recording musicians, and looking for opportunities to feature on Recording Artists tracks or join an Artist as a Recording Musician. They can offer their services, while also being invited to collaborate, with all terms agreed between both parties before anything is booked.",
      options: [
        { label: "Session Musician", value: "session-musician", description: "Professional studio musician" },
        { label: "Recording Musician", value: "recording-musician", description: "Recording and performing musician" },
        { label: "Live Performer", value: "live-musician", description: "Live performance musician" }
      ]
    },
    {
      id: 7,
      title: "Songwriter",
      icon: <Palette className="w-5 h-5" />,
      description: "Songwriters (of either lyrics, or lyrics alongside musical compositions) are looking for work, offering their services to Recording Artists to jointly own the Recording Artists track. They can offer their services, while also being invited to collaborate, with all terms agreed between both parties before anything is booked.",
      options: [
        { label: "Lyricist", value: "lyricist", description: "Specializes in song lyrics" },
        { label: "Composer", value: "composer", description: "Creates musical compositions" },
        { label: "Both", value: "both", description: "Lyrics and music composition" }
      ]
    },
    {
      id: 8,
      title: "Composer",
      icon: <Music className="w-5 h-5" />,
      description: "Composers are looking to write musical compositions for Recording Artists, or collaborate with Recording Artists to jointly own the Recording Artists track. They can offer their services, while also being invited to collaborate, directly through Gigrilla, with all terms agreed between both parties before anything is booked.",
      options: [
        { label: "Film/TV Composer", value: "film-composer", description: "Composes for visual media" },
        { label: "Recording Artist Composer", value: "recording-composer", description: "Composes for recording artists" },
        { label: "Collaborative Composer", value: "collaborative-composer", description: "Works with other artists" }
      ]
    }
  ];

  const handleSubmit = () => {
    if (selectedType && selectedOption) {
      console.log('Selected Artist Type:', selectedType, 'Option:', selectedOption);
      // TODO: Submit to API
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Select the type of Artist that best describes you
          </h2>
          <p className="text-gray-600">
            Choose your artist category and configuration to help us match you with the right opportunities
          </p>
        </div>

        {/* Artist Type Categories */}
        <div className="space-y-4">
          {artistTypes.map((type) => (
            <div key={type.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
                className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                    {type.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Artist Type {type.id} = {type.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{type.description}</p>
                  </div>
                </div>
                {selectedType === type.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {selectedType === type.id && (
                <div className="p-4 bg-white border-t border-gray-100">
                  <p className="text-sm text-gray-700 mb-4">{type.description}</p>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Choose your configuration:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {type.options.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`artist-type-${type.id}`}
                            value={option.value}
                            checked={selectedOption === option.value}
                            onChange={(e) => setSelectedOption(e.target.value)}
                            className="mt-0.5 text-purple-600"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected Summary */}
        {selectedType && selectedOption && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">
                Selected: {artistTypes.find(t => t.id === selectedType)?.title} - {
                  artistTypes.find(t => t.id === selectedType)?.options.find(o => o.value === selectedOption)?.label
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Selection Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Choices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Music className="w-6 h-6" />, title: "Recording Artist", desc: "Original music & live gigs" },
            { icon: <Mic className="w-6 h-6" />, title: "Singer/Vocalist", desc: "Vocal performance & sessions" },
            { icon: <Headphones className="w-6 h-6" />, title: "DJ-Producer", desc: "DJ sets & music production" },
            { icon: <Users className="w-6 h-6" />, title: "Live Performer", desc: "Stage performance & shows" }
          ].map((choice, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedType(index + 1);
                setSelectedOption(artistTypes[index]?.options[0]?.value || '');
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-3">
                {choice.icon}
              </div>
              <h4 className="font-medium text-gray-900">{choice.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{choice.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSubmit}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8"
          disabled={!selectedType || !selectedOption}
        >
          Submit Artist Type
        </Button>
      </div>
    </div>
  );
}
