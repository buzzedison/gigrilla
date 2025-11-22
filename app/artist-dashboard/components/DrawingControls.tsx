"use client"

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import * as L from 'leaflet'

interface DrawingControlsProps {
  mode: 'radius' | 'polygon' | 'country'
  onZoneCreated: (zone: {
    type: 'radius' | 'polygon' | 'country'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[] | any
    coordinates?: number[][]
    radius?: number
    center?: [number, number]
  } | null) => void
}

function DrawingControlsInner({ mode, onZoneCreated }: DrawingControlsProps) {
  const map = useMap() // Use the hook directly at the top level
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null)
  const drawControlRef = useRef<L.Control.Draw | null>(null)

  useEffect(() => {
    if (!map || typeof window === 'undefined') return

    const initializeDrawing = async () => {
      try {
        // Import Leaflet and Leaflet.draw
        const L = await import('leaflet')
        const LeafletDraw = await import('leaflet-draw')
        
        // Wait a bit for the library to fully initialize
        await new Promise(resolve => setTimeout(resolve, 100))

        // Fix default icon issue
        delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        console.log('Initializing drawing controls with map:', map)
        console.log('L.Draw available:', !!L.Draw)
        console.log('L.Control.Draw available:', !!(L.Control.Draw))

        // Remove existing draw controls
        if (drawControlRef.current) {
          map.removeControl(drawControlRef.current)
          drawControlRef.current = null
        }

        // Create feature group for drawn items
        if (drawnItemsRef.current) {
          map.removeLayer(drawnItemsRef.current)
        }
        drawnItemsRef.current = new L.FeatureGroup()
        map.addLayer(drawnItemsRef.current)

        // Configure draw options
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const drawOptions: any = {
          edit: {
            featureGroup: drawnItemsRef.current,
            remove: true
          },
          draw: {
            rectangle: false,
            polyline: false,
            marker: false,
            circlemarker: false,
            circle: mode === 'radius',
            polygon: mode === 'polygon'
          }
        }

        // Add circle options for radius mode
        if (mode === 'radius') {
          drawOptions.draw.circle = {
            shapeOptions: {
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.2,
              weight: 2
            },
            showRadius: true,
            metric: true,
            feet: false,
            radius: 50000 // 50km in meters
          }
        }

        // Add polygon options for polygon mode
        if (mode === 'polygon') {
          drawOptions.draw.polygon = {
            shapeOptions: {
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.2,
              weight: 2
            },
            allowIntersection: false,
            drawError: {
              color: '#e1e5e9',
              message: '<strong>Error:</strong> Shape edges cannot cross!'
            },
            shapeName: 'Custom Gig Zone'
          }
        }

        // Verify L.Control.Draw is available before using it
        if (!L.Control.Draw) {
          console.error('Leaflet.Draw Control not properly loaded')
          console.log('Available L properties:', Object.keys(L))
          console.log('Available L.Control properties:', Object.keys(L.Control))
          return
        }

        // Add draw control to map
        drawControlRef.current = new L.Control.Draw(drawOptions)
        map.addControl(drawControlRef.current)

        console.log('Drawing controls added to map')

        // Handle drawing creation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleDrawCreated = (e: any) => {
          console.log('Draw created:', e.layerType)
          const layer = e.layer
          
          // Clear any existing drawn items first
          if (drawnItemsRef.current) {
            drawnItemsRef.current.clearLayers()
          }
          
          // Add the new layer
          if (drawnItemsRef.current) {
            drawnItemsRef.current.addLayer(layer)
          }

          if (e.layerType === 'circle') {
            // Handle radius circle
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const center = (layer as any).getLatLng()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const radius = (layer as any).getRadius() / 1000 // Convert meters to km
            
            const zone = {
              type: 'radius' as const,
              data: [{ lat: center.lat, lng: center.lng }],
              radius: Math.round(radius)
            }
            
            console.log('Radius zone created:', zone)
            onZoneCreated(zone)
          } else if (e.layerType === 'polygon') {
            // Handle polygon
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const latlngs = (layer as any).getLatLngs()[0]
            const points = latlngs.map((latlng: L.LatLng) => ({
              lat: latlng.lat,
              lng: latlng.lng
            }))
            
            const zone = {
              type: 'polygon' as const,
              data: points
            }
            
            console.log('Polygon zone created:', zone)
            onZoneCreated(zone)
          }
        }

        // Handle drawing deletion
        const handleDrawDeleted = () => {
          console.log('Draw deleted')
          onZoneCreated(null)
        }

        // Use string event names instead of L.Draw.Event constants
        map.on('draw:created', handleDrawCreated)
        map.on('draw:deleted', handleDrawDeleted)

      } catch (error) {
        console.error('Error initializing drawing controls:', error)
      }
    }

    initializeDrawing()

    // Cleanup
    return () => {
      if (map && drawControlRef.current) {
        map.removeControl(drawControlRef.current)
      }
      if (map && drawnItemsRef.current) {
        map.removeLayer(drawnItemsRef.current)
      }
    }
  }, [map, mode, onZoneCreated])

  return null // Controls are added directly to the map
}

export function DrawingControls(props: DrawingControlsProps) {
  return <DrawingControlsInner {...props} />
}
