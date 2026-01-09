'use client';

// useEffect, useState imports removed - not used
import dynamic from 'next/dynamic';

// Dynamically import the entire map to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200" style={{ height: '400px' }}>
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interactive map...</p>
        </div>
      </div>
    </div>
  )
});

interface InteractiveMapProps {
  zipCode?: string;
  localRadius?: number;
  widerRadius?: number;
  isWorldView?: boolean;
}

export function InteractiveMap({ zipCode = "90266", localRadius = 5000, widerRadius = 50000, isWorldView = false }: InteractiveMapProps) {
  return (
    <MapComponent 
      zipCode={zipCode}
      localRadius={localRadius}
      widerRadius={widerRadius}
      isWorldView={isWorldView}
    />
  );
}
