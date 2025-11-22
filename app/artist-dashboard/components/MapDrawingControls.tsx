"use client"

import { DrawingControls } from './DrawingControls'

type MapDrawingControlsProps = {
  mode: 'radius' | 'polygon' | 'country'
  onZoneCreated: Parameters<typeof DrawingControls>[0]['onZoneCreated']
  baseLocation?: { lat: number; lng: number }
}

export function MapDrawingControls({ baseLocation, ...rest }: MapDrawingControlsProps) {
  // MapDrawingControls historically accepted a baseLocation prop when it
  // managed the Leaflet instance manually. DrawingControls now encapsulates
  // all of that behavior, so this wrapper simply forwards the relevant props
  // while keeping the previous API surface intact.
  void baseLocation

  return <DrawingControls {...rest} />
}
