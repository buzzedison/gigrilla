'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Edit2, Trash2, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  isNew?: boolean;
  uploadProgress?: number;
}

export function ArtistPhotosManager() {
  const [photos, setPhotos] = useState<PhotoItem[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      caption: 'Strings at Denver'
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
      caption: 'My Denver People'
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      caption: 'Shims of Silence'
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop',
      caption: 'Rock On Denver!'
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      caption: 'Strings at Denver'
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
      caption: 'My Denver People'
    },
    {
      id: '7',
      url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      caption: 'Shims of Silence'
    },
    {
      id: '8',
      url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop',
      caption: 'Rock On Denver!'
    }
  ]);

  const [newPhoto, setNewPhoto] = useState<PhotoItem | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [caption, setCaption] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhotoItem: PhotoItem = {
          id: Date.now().toString(),
          url: e.target?.result as string,
          caption: 'Add A Caption Here',
          isNew: true,
          uploadProgress: 0
        };
        setNewPhoto(newPhotoItem);
        setCaption('Add A Caption Here');
      };
      reader.readAsDataURL(file);

      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 20;
        });
      }, 200);
    }
  };

  const handleAddPhoto = () => {
    if (newPhoto && caption) {
      const updatedPhoto = { ...newPhoto, caption, uploadProgress: 100, isNew: false };
      setPhotos(prev => [updatedPhoto, ...prev]);
      setNewPhoto(null);
      setCaption('');
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const handleCaptionChange = (id: string, newCaption: string) => {
    setPhotos(prev => prev.map(photo =>
      photo.id === id ? { ...photo, caption: newCaption } : photo
    ));
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Add Photos</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Upload Photos For Your Profile
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Area */}
          <div
            className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-600 font-medium">Drag & Drop or</p>
                <p className="text-gray-500 text-sm">Click to Upload Your Photos</p>
              </div>
            </div>
          </div>

          {/* Upload Preview */}
          <div className="flex flex-col justify-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">photo.jpg</p>
                  <p className="text-xs text-gray-500">New photo upload</p>
                </div>
              </div>

              {newPhoto && (
                <div className="space-y-3">
                  <Input
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add A Caption Here"
                    className="text-sm"
                  />
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{uploadProgress}%</p>
                  <Button
                    onClick={handleAddPhoto}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                    disabled={uploadProgress < 100}
                  >
                    Upload
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">Artist Photos</h2>
            <Badge variant="outline" className="text-xs">
              {photos.length} photos
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-500">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                />
                {/* Overlay controls */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-8 h-8 p-0 bg-white hover:bg-gray-100"
                      onClick={() => handleCaptionChange(photo.id, prompt('Edit caption:', photo.caption) || photo.caption)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-8 h-8 p-0"
                      onClick={() => handleRemovePhoto(photo.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Caption and rating */}
              <div className="mt-2">
                <p className="text-sm text-gray-900 truncate">{photo.caption}</p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-500">{(4.5 + Math.random() * 0.5).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" className="px-8">
          Save Photos
        </Button>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8">
          Publish Photos
        </Button>
      </div>
    </div>
  );
}
