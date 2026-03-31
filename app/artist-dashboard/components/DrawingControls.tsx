"use client"

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import * as L from 'leaflet'

interface DrawingControlsProps {
  mode: 'radius' | 'polygon' | 'country'
  baseLocation?: { lat: number; lng: number }
  value?: {
    type: 'radius' | 'polygon' | 'country'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[] | any
    coordinates?: number[][]
    radius?: number
    center?: [number, number]
  } | null
  onZoneCreated: (zone: {
    type: 'radius' | 'polygon' | 'country'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[] | any
    coordinates?: number[][]
    radius?: number
    center?: [number, number]
  } | null) => void
}

function DrawingControlsInner({ mode, baseLocation, value, onZoneCreated }: DrawingControlsProps) {
  const map = useMap() // Use the hook directly at the top level
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null)
  const drawControlRef = useRef<L.Control.Draw | null>(null)

  useEffect(() => {
    if (!map || typeof window === 'undefined') return

    const initializeDrawing = async () => {
      try {
        // Import Leaflet and Leaflet.draw
        const L = await import('leaflet')
        await import('leaflet-draw')
        
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

        const shapeOptions = {
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
          weight: 2
        }

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
            circle: false,
            polygon: mode === 'polygon'
          }
        }

        // Add polygon options for polygon mode
        if (mode === 'polygon') {
          drawOptions.draw.polygon = {
            shapeOptions,
            allowIntersection: false,
            drawError: {
              color: '#e1e5e9',
              message: '<strong>Error:</strong> Shape edges cannot cross!'
            },
            shapeName: 'Custom Gig Zone'
          }
        }

        // Verify L.Control.Draw is available before using it where needed
        if (mode === 'polygon' && !L.Control.Draw) {
          console.error('Leaflet.Draw Control not properly loaded')
          console.log('Available L properties:', Object.keys(L))
          console.log('Available L.Control properties:', Object.keys(L.Control))
          return
        }

        const cleanupFns: Array<() => void> = []

        const keepCircleInView = (circle: L.Circle) => {
          if (!map || !circle) return

          try {
            const circleBounds = circle.getBounds()
            const currentBounds = map.getBounds().pad(-0.08)

            if (!currentBounds.contains(circleBounds)) {
              map.fitBounds(circleBounds, {
                padding: [50, 50],
                animate: false
              })
            }
          } catch (error) {
            console.warn('Skipping circle auto-fit while map projection is unavailable', error)
          }
        }

        if (mode === 'polygon') {
          // Add draw control to map
          drawControlRef.current = new L.Control.Draw(drawOptions)
          map.addControl(drawControlRef.current)
          console.log('Drawing controls added to map')
        }

        if (mode === 'radius') {
          drawControlRef.current = new L.Control.Draw({
            edit: {
              featureGroup: drawnItemsRef.current,
              remove: true
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            draw: {
              rectangle: false,
              polyline: false,
              marker: false,
              circlemarker: false,
              circle: false,
              polygon: false
            } as any
          })
          map.addControl(drawControlRef.current)
        }

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

          if (e.layerType === 'polygon') {
            // Handle polygon
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const latlngs = (layer as any).getLatLngs()[0]
            const points = latlngs.map((latlng: L.LatLng) => ({
              lat: latlng.lat,
              lng: latlng.lng
            }))

            // Auto-zoom map to fit the entire polygon
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const bounds = (layer as any).getBounds()
            if (bounds && map) {
              map.fitBounds(bounds, { padding: [50, 50] })
            }

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

        if (mode === 'polygon') {
          // Use string event names instead of L.Draw.Event constants
          map.on('draw:created', handleDrawCreated)
          map.on('draw:deleted', handleDrawDeleted)
          cleanupFns.push(() => map.off('draw:created', handleDrawCreated))
          cleanupFns.push(() => map.off('draw:deleted', handleDrawDeleted))
        }

        if (mode === 'radius' && baseLocation) {
          const center = L.latLng(baseLocation.lat, baseLocation.lng)
          let isRadiusDrawing = false
          let activeCircle: L.Circle | null = null
          const container = map.getContainer()
          container.style.cursor = 'crosshair'

          const getRadiusCenter = () => {
            if (value?.type === 'radius') {
              if (value.center && value.center.length === 2) {
                return L.latLng(value.center[0], value.center[1])
              }

              if (Array.isArray(value.data) && value.data[0]?.lat && value.data[0]?.lng) {
                return L.latLng(value.data[0].lat, value.data[0].lng)
              }
            }

            return center
          }

          const syncRadiusZone = (circle: L.Circle) => {
            const circleCenter = circle.getLatLng()
            const nextRadiusKm = Math.round(circle.getRadius() / 1000)

            onZoneCreated({
              type: 'radius',
              data: [{ lat: circleCenter.lat, lng: circleCenter.lng }],
              radius: nextRadiusKm,
              center: [circleCenter.lat, circleCenter.lng]
            })
          }

          const initialCenter = getRadiusCenter()

          if (value?.type === 'radius' && typeof value.radius === 'number' && value.radius > 0) {
            activeCircle = L.circle(initialCenter, {
              ...shapeOptions,
              radius: value.radius * 1000
            })
            drawnItemsRef.current?.clearLayers()
            drawnItemsRef.current?.addLayer(activeCircle)
            keepCircleInView(activeCircle)
          }

          const updateRadiusCircle = (latlng?: L.LatLng | null) => {
            if (!latlng) return
            const nextRadius = Math.max(initialCenter.distanceTo(latlng), 1)

            if (!activeCircle) {
              activeCircle = L.circle(initialCenter, {
                ...shapeOptions,
                radius: nextRadius
              })
              drawnItemsRef.current?.clearLayers()
              drawnItemsRef.current?.addLayer(activeCircle)
            } else {
              activeCircle.setRadius(nextRadius)
            }

            if (activeCircle) {
              keepCircleInView(activeCircle)
            }
          }

          const startRadiusDraw = (e: L.LeafletMouseEvent) => {
            isRadiusDrawing = true
            map.dragging.disable()
            updateRadiusCircle(e.latlng)
          }

          const moveRadiusDraw = (e: L.LeafletMouseEvent) => {
            if (!isRadiusDrawing) return
            updateRadiusCircle(e.latlng)
          }

          const handleRadiusMouseOut = () => {
            finishRadiusDraw()
          }

          const finishRadiusDraw = (e?: L.LeafletMouseEvent) => {
            if (!isRadiusDrawing) return
            isRadiusDrawing = false
            map.dragging.enable()

            if (e?.latlng) updateRadiusCircle(e.latlng)
            if (!activeCircle) return

            try {
              map.fitBounds(activeCircle.getBounds(), { padding: [50, 50] })
            } catch (error) {
              console.warn('Skipping radius final fit while map projection is unavailable', error)
            }
            syncRadiusZone(activeCircle)
          }

          const handleEdited = () => {
            if (!drawnItemsRef.current) return

            drawnItemsRef.current.eachLayer((layer) => {
              if (layer instanceof L.Circle) {
                activeCircle = layer
                keepCircleInView(layer)
                syncRadiusZone(layer)
              }
            })
          }

          const handleEditStart = () => {
            if (activeCircle) {
              keepCircleInView(activeCircle)
            }
          }

          map.on('mousedown', startRadiusDraw)
          map.on('mousemove', moveRadiusDraw)
          map.on('mouseup', finishRadiusDraw)
          map.on('mouseout', handleRadiusMouseOut)
          map.on('draw:edited', handleEdited)
          map.on('draw:editstart', handleEditStart)
          map.on('draw:deleted', handleDrawDeleted)

          cleanupFns.push(() => {
            container.style.cursor = ''
            map.off('mousedown', startRadiusDraw)
            map.off('mousemove', moveRadiusDraw)
            map.off('mouseup', finishRadiusDraw)
            map.off('mouseout', handleRadiusMouseOut)
            map.off('draw:edited', handleEdited)
            map.off('draw:editstart', handleEditStart)
            map.off('draw:deleted', handleDrawDeleted)
            map.dragging.enable()
          })
        }

        return () => {
          cleanupFns.forEach((cleanup) => cleanup())
        }

      } catch (error) {
        console.error('Error initializing drawing controls:', error)
      }
    }

    let cleanupDrawing: (() => void) | undefined
    initializeDrawing().then((cleanup) => {
      cleanupDrawing = cleanup
    })

    // Cleanup
    return () => {
      cleanupDrawing?.()
      if (map && drawControlRef.current) {
        map.removeControl(drawControlRef.current)
        drawControlRef.current = null
      }
      if (map && drawnItemsRef.current) {
        map.removeLayer(drawnItemsRef.current)
        drawnItemsRef.current = null
      }
    }
  }, [map, mode, onZoneCreated, baseLocation, value])

  return null // Controls are added directly to the map
}

export function DrawingControls(props: DrawingControlsProps) {
  return <DrawingControlsInner {...props} />
}
