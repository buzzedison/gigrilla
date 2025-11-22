# Leaflet.js Integration Guide for Gig-Ability Maps

## Why Leaflet.js?

✅ **FREE** - No API keys, no billing
✅ **Open Source** - Community-driven
✅ **Lightweight** - Fast performance
✅ **Drawing Tools** - Built-in polygon/circle drawing
✅ **OpenStreetMap** - Free map tiles

## Installation

```bash
npm install leaflet react-leaflet leaflet-draw
npm install --save-dev @types/leaflet @types/leaflet-draw
```

## Required CSS

Add to `app/globals.css`:

```css
@import 'leaflet/dist/leaflet.css';
@import 'leaflet-draw/dist/leaflet.draw.css';
```

## Implementation Steps

### 1. Update GigAbilityMap Component

Replace the placeholder map div with:

```typescript
import { MapContainer, TileLayer, Circle, Polygon, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// In the component:
<MapContainer
  center={[baseLocation?.lat || 51.5074, baseLocation?.lng || -0.1278]}
  zoom={10}
  style={{ height: '400px', width: '100%' }}
  className="rounded-lg"
>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  />
  
  {/* Base Location Marker */}
  {baseLocation && (
    <Marker position={[baseLocation.lat, baseLocation.lng]} />
  )}
  
  {/* Radius Circle */}
  {value?.type === 'radius' && baseLocation && (
    <Circle
      center={[baseLocation.lat, baseLocation.lng]}
      radius={value.radius * 1000} // Convert km to meters
      pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
    />
  )}
  
  {/* Polygon Zone */}
  {value?.type === 'polygon' && Array.isArray(value.data) && (
    <Polygon
      positions={value.data.map(p => [p.lat, p.lng])}
      pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
    />
  )}
</MapContainer>
```

### 2. Add Drawing Controls

For interactive drawing:

```typescript
import { FeatureGroup } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'

<FeatureGroup>
  <EditControl
    position="topright"
    onCreated={(e) => {
      if (e.layerType === 'circle') {
        const circle = e.layer
        const center = circle.getLatLng()
        const radius = circle.getRadius() / 1000 // Convert to km
        onChange({
          type: 'radius',
          data: [{ lat: center.lat, lng: center.lng }],
          radius: radius
        })
      } else if (e.layerType === 'polygon') {
        const polygon = e.layer
        const points = polygon.getLatLngs()[0].map(p => ({
          lat: p.lat,
          lng: p.lng
        }))
        onChange({
          type: 'polygon',
          data: points
        })
      }
    }}
    draw={{
      rectangle: false,
      polyline: false,
      marker: false,
      circlemarker: false,
      circle: mode === 'radius',
      polygon: mode === 'polygon'
    }}
  />
</FeatureGroup>
```

### 3. Geocoding for Base Location

To convert artist base location address to coordinates:

```typescript
// Use Nominatim (free OpenStreetMap geocoding)
async function geocodeAddress(address: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
  )
  const data = await response.json()
  if (data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    }
  }
  return null
}
```

### 4. Update Database Schema

The current migration already supports this:

```sql
-- Migration 034 already includes:
local_gig_area JSONB DEFAULT '{}'
wider_gig_area JSONB DEFAULT '{}'

-- Also add coordinates to base_location if not already present:
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS base_location_lat DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS base_location_lon DECIMAL(10,8);
```

## Map Features

### Local Gig Area
- **Center**: Artist base location
- **Tools**: Radius circle, custom polygon
- **Visual**: Blue overlay showing coverage
- **No API costs**: Free OpenStreetMap tiles

### Wider Gig Area
- **Center**: Artist base location
- **Tools**: Radius circle, custom polygon, country selection
- **Visual**: Blue overlay + country highlights
- **Flexible**: Can combine multiple zones

## Best Practices

1. **Always Center on Base Location**: Map should load centered on artist's location
2. **Default Zoom**: Use zoom level 10 for city-level view
3. **Save Coordinates**: Store lat/lng in database for fast loading
4. **Validate Zones**: Ensure polygons have at least 3 points
5. **Performance**: Limit polygon complexity to 50 points max

## Example Data Structure

```json
{
  "type": "radius",
  "data": [{ "lat": 51.5074, "lng": -0.1278 }],
  "radius": 50
}

{
  "type": "polygon",
  "data": [
    { "lat": 51.5074, "lng": -0.1278 },
    { "lat": 51.5174, "lng": -0.1178 },
    { "lat": 51.5074, "lng": -0.1078 }
  ]
}

{
  "type": "country",
  "data": "GB"
}
```

## Next Steps

1. Install Leaflet packages
2. Update GigAbilityMap.tsx with real map
3. Add geocoding for base location
4. Test drawing tools
5. Implement save/load from database

## Resources

- [Leaflet.js Docs](https://leafletjs.com/)
- [React Leaflet](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Nominatim Geocoding](https://nominatim.org/)
