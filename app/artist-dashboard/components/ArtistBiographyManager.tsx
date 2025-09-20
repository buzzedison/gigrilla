"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Save, Upload, Cloud, X, FileImage } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  progress: number;
  url?: string;
}

export function ArtistBiographyManager() {
  const [biography, setBiography] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: "1",
      name: "kilaabout.jpg",
      progress: 60,
      url: "/placeholder-image.jpg"
    }
  ]);

  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const newFile: UploadedFile = {
          id: Date.now().toString(),
          name: file.name,
          progress: 0,
          url: URL.createObjectURL(file)
        };
        setUploadedFiles(prev => [...prev, newFile]);

        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadedFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === newFile.id
                ? { ...f, progress: Math.min(f.progress + 10, 100) }
                : f
            )
          );
        }, 100);

        setTimeout(() => {
          clearInterval(interval);
          setUploadedFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === newFile.id ? { ...f, progress: 100 } : f
            )
          );
        }, 1000);
      }
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const newFile: UploadedFile = {
          id: Date.now().toString(),
          name: file.name,
          progress: 0,
          url: URL.createObjectURL(file)
        };
        setUploadedFiles(prev => [...prev, newFile]);

        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadedFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === newFile.id
                ? { ...f, progress: Math.min(f.progress + 10, 100) }
                : f
            )
          );
        }, 100);

        setTimeout(() => {
          clearInterval(interval);
          setUploadedFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === newFile.id ? { ...f, progress: 100 } : f
            )
          );
        }, 1000);
      }
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Biography Text Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Write about Kendrick Lamar</h2>
          <p className="text-gray-600 text-sm">Tell your fans about your journey, influences, and what makes you unique as an artist.</p>
        </div>

        <Textarea
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
          placeholder="Start here..."
          className="min-h-[300px] text-base leading-relaxed resize-none border-gray-200 focus:border-purple-300 focus:ring-purple-300"
        />

        <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
          <span>{biography.length} characters</span>
          <span>Minimum 100 characters recommended</span>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Your Artwork for The About Section</h3>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? "border-purple-400 bg-purple-50"
              : "border-gray-300 hover:border-purple-400 hover:bg-gray-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center">
            <Cloud className={`w-12 h-12 mb-4 ${isDragOver ? "text-purple-500" : "text-gray-400"}`} />
            <p className="text-lg font-medium text-gray-900 mb-2">Drag & Drop or</p>
            <p className="text-gray-600 mb-4">Click to Upload Your Artwork</p>

            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="bg-gray-50 hover:bg-gray-100"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
            </label>
          </div>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileImage className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">{file.progress}% uploaded</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    ></div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" className="px-8">
          <Save className="w-4 h-4 mr-2" />
          Save Biography
        </Button>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8">
          Publish Biography
        </Button>
      </div>
    </div>
  );
}
