'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export function LogoProfileArtwork() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoUploadProgress, setLogoUploadProgress] = useState(0);

  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string>('');
  const [artworkUploadProgress, setArtworkUploadProgress] = useState(0);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Simulate upload progress
      setLogoUploadProgress(0);
      const interval = setInterval(() => {
        setLogoUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const handleArtworkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setArtworkFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setArtworkPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Simulate upload progress
      setArtworkUploadProgress(0);
      const interval = setInterval(() => {
        setArtworkUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 15;
        });
      }, 150);
    }
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview('');
    setLogoUploadProgress(0);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleArtworkRemove = () => {
    setArtworkFile(null);
    setArtworkPreview('');
    setArtworkUploadProgress(0);
    if (artworkInputRef.current) {
      artworkInputRef.current.value = '';
    }
  };

  const handleUploadLogo = () => {
    // TODO: Implement actual upload to storage
    console.log('Uploading logo:', logoFile);
  };

  const handleUploadArtwork = () => {
    // TODO: Implement actual upload to storage
    console.log('Uploading artwork:', artworkFile);
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Upload Your Logo</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Minimum: 120px by 120px | Maximum size: 12KB
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logo Upload Area */}
          <div
            className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => logoInputRef.current?.click()}
          >
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />

            {logoPreview ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogoRemove();
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${logoUploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{logoUploadProgress}%</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Drag & Drop or</p>
                  <p className="text-gray-500 text-sm">Click to Upload Your Logo</p>
                </div>
              </div>
            )}
          </div>

          {/* Logo Preview */}
          <div className="flex flex-col justify-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">logo.jpg</p>
                  <p className="text-xs text-gray-500">Artist logo preview</p>
                </div>
              </div>

              {logoPreview && (
                <Button
                  onClick={handleUploadLogo}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  disabled={logoUploadProgress < 100}
                >
                  Upload
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Artwork Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Upload Your Profile Artwork</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Minimum: 120px by 120px | Maximum size: 24KB
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Artwork Upload Area */}
          <div
            className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => artworkInputRef.current?.click()}
          >
            <input
              ref={artworkInputRef}
              type="file"
              accept="image/*"
              onChange={handleArtworkUpload}
              className="hidden"
            />

            {artworkPreview ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={artworkPreview}
                    alt="Artwork preview"
                    className="w-48 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArtworkRemove();
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${artworkUploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{artworkUploadProgress}%</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Drag & Drop or</p>
                  <p className="text-gray-500 text-sm">Click to Upload Your Profile Artwork</p>
                </div>
              </div>
            )}
          </div>

          {/* Artwork Preview */}
          <div className="flex flex-col justify-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">artwork.jpg</p>
                  <p className="text-xs text-gray-500">Profile artwork preview</p>
                </div>
              </div>

              {artworkPreview && (
                <Button
                  onClick={handleUploadArtwork}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  disabled={artworkUploadProgress < 100}
                >
                  Upload
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" className="px-8">
          Save Logo/Profile Artwork
        </Button>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8">
          Publish Logo/Profile Artwork
        </Button>
      </div>
    </div>
  );
}
