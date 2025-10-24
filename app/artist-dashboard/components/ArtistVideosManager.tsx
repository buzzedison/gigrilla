'use client';

import { useState } from 'react';
import { Video, Edit2, Trash2, Star, Play, Youtube } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

interface VideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  thumbnail: string;
  duration?: string;
  isNew?: boolean;
}

export function ArtistVideosManager() {
  const [videos, setVideos] = useState<VideoItem[]>([
    {
      id: '1',
      title: 'Acoustic Ses...',
      youtubeUrl: 'https://youtube.com/watch?v=example1',
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop'
    },
    {
      id: '2',
      title: '30sc at Denver',
      youtubeUrl: 'https://youtube.com/watch?v=example2',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=200&fit=crop'
    },
    {
      id: '3',
      title: 'Like You',
      youtubeUrl: 'https://youtube.com/watch?v=example3',
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop'
    },
    {
      id: '4',
      title: 'Violin Time',
      youtubeUrl: 'https://youtube.com/watch?v=example4',
      thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop'
    }
  ]);

const [newYoutubeUrl, setNewYoutubeUrl] = useState('');
const [newVideo, setNewVideo] = useState<VideoItem | null>(null);

  const handleYoutubeEmbed = () => {
    if (newYoutubeUrl.trim()) {
      // Extract video ID from YouTube URL
      const videoId = extractVideoId(newYoutubeUrl);
      if (videoId) {
        const newVideoItem: VideoItem = {
          id: Date.now().toString(),
          title: 'New Video',
          youtubeUrl: newYoutubeUrl,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          isNew: true
        };
        setNewVideo(newVideoItem);
        setVideos(prev => [newVideoItem, ...prev]);
        setNewYoutubeUrl('');
      }
    }
  };

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const handleRemoveVideo = (id: string) => {
    setVideos(prev => prev.filter(video => video.id !== id));
    if (newVideo?.id === id) {
      setNewVideo(null);
    }
  };

  const handleTitleChange = (id: string, newTitle: string) => {
    setVideos(prev => prev.map(video =>
      video.id === id ? { ...video, title: newTitle } : video
    ));
  };

  return (
    <div className="space-y-6">
      {/* YouTube Embed Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Add Videos</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Embed A YouTube Link To Your Video Here
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* YouTube URL Input */}
          <div className="space-y-4">
            <div className="flex space-x-3">
              <div className="flex-1">
                <Input
                  value={newYoutubeUrl}
                  onChange={(e) => setNewYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/"
                  className="text-sm"
                />
              </div>
              <Button
                onClick={handleYoutubeEmbed}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6"
                disabled={!newYoutubeUrl.trim()}
              >
                Upload
              </Button>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Youtube className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">YouTube Integration</p>
                  <p className="text-xs text-gray-600">Supports youtube.com and youtu.be links</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex flex-col justify-center">
            {newVideo ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={newVideo.thumbnail}
                  alt={newVideo.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-gray-900 ml-1" />
                      </div>
                    </div>
                  </div>
                  <Input
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                    placeholder="Enter video title"
                    className="text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm">Enter a YouTube URL to preview your video</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">Artist Videos</h2>
            <Badge variant="outline" className="text-xs">
              {videos.length} videos
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-500">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {videos.map((video) => (
            <div key={video.id} className="relative group">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-gray-900 ml-1" />
                  </div>
                </div>

                {/* Overlay controls */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-8 h-8 p-0 bg-white hover:bg-gray-100"
                      onClick={() => handleTitleChange(video.id, prompt('Edit title:', video.title) || video.title)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-8 h-8 p-0"
                      onClick={() => handleRemoveVideo(video.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Video info */}
              <div className="mt-2">
                <p className="text-sm text-gray-900 truncate">{video.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-500">{(4.2 + Math.random() * 0.8).toFixed(1)}</span>
                  </div>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    YouTube
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" className="px-8">
          Save Videos
        </Button>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8">
          Publish Videos
        </Button>
      </div>
    </div>
  );
}
