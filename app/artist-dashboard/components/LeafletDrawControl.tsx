"use client"

interface LeafletDrawControlProps {
  mode: 'radius' | 'polygon' | 'country'
  onZoneCreated: (zone: {
    type: string
    coordinates?: number[][]
    radius?: number
    center?: [number, number]
  }) => void
}

export function LeafletDrawControl({ mode, onZoneCreated }: LeafletDrawControlProps) {
  // This component is no longer used - replaced by DrawingControls.tsx
  // Keeping this file to avoid any import errors
  return null
}
