"use client"

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import * as L from 'leaflet'

interface MapPoint { lat: number; lng: number }

interface ZoneValue {
  type: 'radius' | 'polygon' | 'country'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[] | any
  radius?: number
  center?: [number, number]
}

interface DrawingControlsProps {
  mode: 'radius' | 'polygon' | 'country'
  baseLocation?: { lat: number; lng: number }
  value?: ZoneValue | null
  onZoneCreated: (zone: ZoneValue | null) => void
}

const SHAPE_OPTIONS = {
  color: '#7c3aed',
  fillColor: '#7c3aed',
  fillOpacity: 0.15,
  weight: 2.5,
}

function DrawingControlsInner({ mode, baseLocation, value, onZoneCreated }: DrawingControlsProps) {
  const map = useMap()
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null)
  const drawControlRef = useRef<L.Control.Draw | null>(null)

  // Keep stable refs so effects don't need them as deps
  const onZoneCreatedRef = useRef(onZoneCreated)
  const valueRef = useRef(value)
  useEffect(() => { onZoneCreatedRef.current = onZoneCreated }, [onZoneCreated])
  useEffect(() => { valueRef.current = value }, [value])

  // ─── Effect 1: set up drawing controls (re-runs only on mode / location change) ───
  useEffect(() => {
    if (!map || typeof window === 'undefined') return

    let cleanupFns: Array<() => void> = []
    let cancelled = false

    const setup = async () => {
      try {
        const L = await import('leaflet')
        await import('leaflet-draw')
        await new Promise(r => setTimeout(r, 50))
        if (cancelled) return

        // Fix default marker icons
        delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        // Remove stale controls / layers
        if (drawControlRef.current) {
          try { map.removeControl(drawControlRef.current) } catch { /* ignore */ }
          drawControlRef.current = null
        }
        if (drawnItemsRef.current) {
          try { map.removeLayer(drawnItemsRef.current) } catch { /* ignore */ }
        }

        drawnItemsRef.current = new L.FeatureGroup()
        map.addLayer(drawnItemsRef.current)

        // ─── POLYGON MODE ────────────────────────────────────────────────────────
        if (mode === 'polygon') {
          if (!L.Control?.Draw) {
            console.error('leaflet-draw Control not loaded')
            return
          }

          // Restore any existing polygon from saved value
          const existing = valueRef.current
          if (existing?.type === 'polygon' && Array.isArray(existing.data) && existing.data.length >= 3) {
            const latlngs = existing.data.map((p: MapPoint) => L.latLng(p.lat, p.lng))
            const poly = L.polygon(latlngs, SHAPE_OPTIONS)
            drawnItemsRef.current?.addLayer(poly)
            try { map.fitBounds(poly.getBounds(), { padding: [40, 40], animate: false }) } catch { /* ignore */ }
          }

          drawControlRef.current = new L.Control.Draw({
            edit: { featureGroup: drawnItemsRef.current, remove: true },
            draw: {
              rectangle: false,
              polyline: false,
              marker: false,
              circlemarker: false,
              circle: false,
              polygon: {
                shapeOptions: SHAPE_OPTIONS,
                allowIntersection: false,
                showArea: true,
                drawError: { color: '#ef4444', message: '<strong>Error:</strong> Lines cannot cross!' },
              },
            } as L.Control.DrawConstructorOptions['draw'],
          })
          map.addControl(drawControlRef.current)

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const onCreated = (e: any) => {
            drawnItemsRef.current?.clearLayers()
            drawnItemsRef.current?.addLayer(e.layer)

            if (e.layerType === 'polygon') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const points: MapPoint[] = e.layer.getLatLngs()[0].map((ll: any) => ({ lat: ll.lat, lng: ll.lng }))
              try { map.fitBounds(e.layer.getBounds(), { padding: [40, 40] }) } catch { /* ignore */ }
              onZoneCreatedRef.current({ type: 'polygon', data: points })
            }
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const onEdited = (e: any) => {
            e.layers.eachLayer((layer: L.Layer) => {
              if (layer instanceof L.Polygon) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const points: MapPoint[] = (layer.getLatLngs()[0] as any[]).map((ll: any) => ({ lat: ll.lat, lng: ll.lng }))
                onZoneCreatedRef.current({ type: 'polygon', data: points })
              }
            })
          }

          const onDeleted = () => onZoneCreatedRef.current(null)

          map.on('draw:created', onCreated)
          map.on('draw:edited', onEdited)
          map.on('draw:deleted', onDeleted)
          cleanupFns.push(() => {
            map.off('draw:created', onCreated)
            map.off('draw:edited', onEdited)
            map.off('draw:deleted', onDeleted)
          })
        }

        // ─── RADIUS MODE ─────────────────────────────────────────────────────────
        if (mode === 'radius' && baseLocation) {
          const container = map.getContainer()
          container.style.cursor = 'crosshair'

          const centerLatLng = L.latLng(baseLocation.lat, baseLocation.lng)
          let isDrawing = false
          let activeCircle: L.Circle | null = null

          // Restore existing radius
          const existing = valueRef.current
          if (existing?.type === 'radius' && typeof existing.radius === 'number' && existing.radius > 0) {
            const c = Array.isArray(existing.data) && existing.data[0]
              ? L.latLng(existing.data[0].lat, existing.data[0].lng)
              : centerLatLng
            activeCircle = L.circle(c, { ...SHAPE_OPTIONS, radius: existing.radius * 1000 })
            drawnItemsRef.current?.addLayer(activeCircle)
            try { map.fitBounds(activeCircle.getBounds(), { padding: [40, 40], animate: false }) } catch { /* ignore */ }
          }

          const syncZone = (circle: L.Circle) => {
            const ll = circle.getLatLng()
            onZoneCreatedRef.current({
              type: 'radius',
              data: [{ lat: ll.lat, lng: ll.lng }],
              radius: Math.max(1, Math.round(circle.getRadius() / 1000)),
              center: [ll.lat, ll.lng],
            })
          }

          const updateCircle = (latlng: L.LatLng) => {
            const dist = Math.max(centerLatLng.distanceTo(latlng), 1000) // min 1km
            if (!activeCircle) {
              activeCircle = L.circle(centerLatLng, { ...SHAPE_OPTIONS, radius: dist })
              drawnItemsRef.current?.clearLayers()
              drawnItemsRef.current?.addLayer(activeCircle)
            } else {
              activeCircle.setRadius(dist)
            }
          }

          const onMouseDown = (e: L.LeafletMouseEvent) => {
            isDrawing = true
            map.dragging.disable()
            updateCircle(e.latlng)
          }
          const onMouseMove = (e: L.LeafletMouseEvent) => {
            if (!isDrawing) return
            updateCircle(e.latlng)
          }
          const onMouseUp = (e: L.LeafletMouseEvent) => {
            if (!isDrawing) return
            isDrawing = false
            map.dragging.enable()
            updateCircle(e.latlng)
            if (activeCircle) {
              try { map.fitBounds(activeCircle.getBounds(), { padding: [40, 40] }) } catch { /* ignore */ }
              syncZone(activeCircle)
            }
          }
          const onMouseOut = () => {
            if (!isDrawing) return
            isDrawing = false
            map.dragging.enable()
            if (activeCircle) syncZone(activeCircle)
          }

          // Edit support for radius (via leaflet-draw edit toolbar)
          if (L.Control?.Draw) {
            drawControlRef.current = new L.Control.Draw({
              edit: { featureGroup: drawnItemsRef.current, remove: true },
              draw: {
                rectangle: false, polyline: false, marker: false,
                circlemarker: false, circle: false, polygon: false,
              } as L.Control.DrawConstructorOptions['draw'],
            })
            map.addControl(drawControlRef.current)
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const onEdited = (e: any) => {
            e.layers.eachLayer((layer: L.Layer) => {
              if (layer instanceof L.Circle) { activeCircle = layer; syncZone(layer) }
            })
          }
          const onDeleted = () => { activeCircle = null; onZoneCreatedRef.current(null) }

          map.on('mousedown', onMouseDown)
          map.on('mousemove', onMouseMove)
          map.on('mouseup', onMouseUp)
          map.on('mouseout', onMouseOut)
          map.on('draw:edited', onEdited)
          map.on('draw:deleted', onDeleted)

          cleanupFns.push(() => {
            container.style.cursor = ''
            map.dragging.enable()
            map.off('mousedown', onMouseDown)
            map.off('mousemove', onMouseMove)
            map.off('mouseup', onMouseUp)
            map.off('mouseout', onMouseOut)
            map.off('draw:edited', onEdited)
            map.off('draw:deleted', onDeleted)
          })
        }

      } catch (err) {
        console.error('DrawingControls setup error:', err)
      }
    }

    setup()

    return () => {
      cancelled = true
      cleanupFns.forEach(fn => fn())
      if (drawControlRef.current) {
        try { map.removeControl(drawControlRef.current) } catch { /* ignore */ }
        drawControlRef.current = null
      }
      if (drawnItemsRef.current) {
        try { map.removeLayer(drawnItemsRef.current) } catch { /* ignore */ }
        drawnItemsRef.current = null
      }
    }
  // Only re-run when mode or base location changes — NOT on value / onZoneCreated
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, mode, baseLocation?.lat, baseLocation?.lng])


  // ─── Effect 2: sync displayed shape when value is updated externally ─────────
  // (e.g. user types a radius number in the input box, or clears the zone)
  useEffect(() => {
    if (!map || !drawnItemsRef.current) return

    const current = drawnItemsRef.current

    if (!value) {
      current.clearLayers()
      return
    }

    // Only update the visual if there's nothing currently drawn
    // (don't clobber in-progress drawings)
    if (current.getLayers().length === 0) {
      (async () => {
        const L = await import('leaflet')

        if (value.type === 'radius' && typeof value.radius === 'number' && value.radius > 0) {
          const c = Array.isArray(value.data) && value.data[0]
            ? L.latLng(value.data[0].lat, value.data[0].lng)
            : baseLocation ? L.latLng(baseLocation.lat, baseLocation.lng) : null
          if (!c) return
          const circle = L.circle(c, { ...SHAPE_OPTIONS, radius: value.radius * 1000 })
          current.clearLayers()
          current.addLayer(circle)
          try { map.fitBounds(circle.getBounds(), { padding: [40, 40], animate: false }) } catch { /* ignore */ }
        }

        if (value.type === 'polygon' && Array.isArray(value.data) && value.data.length >= 3) {
          const latlngs = value.data.map((p: MapPoint) => L.latLng(p.lat, p.lng))
          const poly = L.polygon(latlngs, SHAPE_OPTIONS)
          current.clearLayers()
          current.addLayer(poly)
          try { map.fitBounds(poly.getBounds(), { padding: [40, 40], animate: false }) } catch { /* ignore */ }
        }
      })()
    }
  }, [value, map, baseLocation])

  return null
}

export function DrawingControls(props: DrawingControlsProps) {
  return <DrawingControlsInner {...props} />
}
