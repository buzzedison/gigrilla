'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';

interface MapComponentProps {
  zipCode?: string;
  localRadius?: number;
  widerRadius?: number;
  isWorldView?: boolean;
}

export default function MapComponent({ zipCode = "90266", localRadius = 5000, widerRadius = 50000, isWorldView = false }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false);

  // Choose center and zoom based on view type
  const center: [number, number] = isWorldView ? [20, 0] : [33.8847, -118.4109]; // World center vs Manhattan Beach
  const defaultZoom = isWorldView ? 2 : 12;

  useEffect(() => {
    setIsClient(true);
    
    // Fix for default markers
    const loadLeaflet = async () => {
      const L = await import('leaflet');
      
      delete (L.default.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    };
    
    loadLeaflet();
  }, []);

  if (!isClient) {
    return (
      <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200" style={{ height: '400px' }}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading interactive map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm" style={{ height: '400px' }}>
      <MapContainer
        center={center}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {isWorldView ? (
          // World view markers for major cities and regions
          <>
            {/* United States */}
            <Marker position={[39.8283, -98.5795]}>
              <Popup>
                <div className="text-center">
                  <strong>🇺🇸 United States</strong><br />
                  Available for gigs<br />
                  <span className="text-green-600">✓ Selected region</span>
                </div>
              </Popup>
            </Marker>
            
            {/* United Kingdom */}
            <Marker position={[55.3781, -3.4360]}>
              <Popup>
                <div className="text-center">
                  <strong>🇬🇧 United Kingdom</strong><br />
                  Available for gigs<br />
                  <span className="text-green-600">✓ Selected region</span>
                </div>
              </Popup>
            </Marker>
            
            {/* Germany */}
            <Marker position={[51.1657, 10.4515]}>
              <Popup>
                <div className="text-center">
                  <strong>🇩🇪 Germany</strong><br />
                  Available for gigs<br />
                  <span className="text-green-600">✓ Selected region</span>
                </div>
              </Popup>
            </Marker>
            
            {/* Australia */}
            <Marker position={[-25.2744, 133.7751]}>
              <Popup>
                <div className="text-center">
                  <strong>🇦🇺 Australia</strong><br />
                  Available for gigs<br />
                  <span className="text-orange-600">🔄 Under consideration</span>
                </div>
              </Popup>
            </Marker>
            
            {/* Canada */}
            <Marker position={[56.1304, -106.3468]}>
              <Popup>
                <div className="text-center">
                  <strong>🇨🇦 Canada</strong><br />
                  Available for gigs<br />
                  <span className="text-green-600">✓ Selected region</span>
                </div>
              </Popup>
            </Marker>
            
            {/* Japan */}
            <Marker position={[36.2048, 138.2529]}>
              <Popup>
                <div className="text-center">
                  <strong>🇯🇵 Japan</strong><br />
                  International market<br />
                  <span className="text-orange-600">🔄 Under consideration</span>
                </div>
              </Popup>
            </Marker>
          </>
        ) : (
          // Local view - Manhattan Beach area
          <>
            {/* Main location marker */}
            <Marker position={center}>
              <Popup>
                <div className="text-center">
                  <strong>Manhattan Beach</strong><br />
                  ZIP: {zipCode}<br />
                  Your base location
                </div>
              </Popup>
            </Marker>
            
            {/* Local gig area circle */}
            <Circle
              center={center}
              radius={localRadius}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 2
              }}
            >
              <Popup>
                <div className="text-center">
                  <strong>Local Gig Area</strong><br />
                  Radius: {(localRadius / 1000).toFixed(1)} km<br />
                  Standard local rate applies
                </div>
              </Popup>
            </Circle>
            
            {/* Wider gig area circle */}
            <Circle
              center={center}
              radius={widerRadius}
              pathOptions={{
                color: '#f59e0b',
                fillColor: '#f59e0b',
                fillOpacity: 0.05,
                weight: 2,
                dashArray: '10, 10'
              }}
            >
              <Popup>
                <div className="text-center">
                  <strong>Extended Gig Area</strong><br />
                  Radius: {(widerRadius / 1000).toFixed(1)} km<br />
                  Travel surcharge may apply
                </div>
              </Popup>
            </Circle>
            
            {/* Sample venue markers */}
            <Marker position={[33.8820, -118.4020]}>
              <Popup>
                <div className="text-center">
                  <strong>🏨 Shade Hotel</strong><br />
                  Luxury beachfront venue<br />
                  <span className="text-green-600">Available for bookings</span>
                </div>
              </Popup>
            </Marker>
            
            <Marker position={[33.8880, -118.4100]}>
              <Popup>
                <div className="text-center">
                  <strong>🏢 The Strand House</strong><br />
                  Upscale restaurant & event space<br />
                  <span className="text-green-600">Available for bookings</span>
                </div>
              </Popup>
            </Marker>
            
            <Marker position={[33.8847, -118.4000]}>
              <Popup>
                <div className="text-center">
                  <strong>🏛️ Manhattan Beach City Hall</strong><br />
                  Public venue<br />
                  <span className="text-blue-600">Requires permits</span>
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
}
