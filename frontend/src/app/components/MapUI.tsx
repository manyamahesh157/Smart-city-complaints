"use client";
import { MapContainer, TileLayer, Marker, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix Leaflet's default icon path issues with Next.js Turbopack natively
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Little helper to recenter map when props change
function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function MapUI({ 
  center = [40.7128, -74.0060], 
  zoom = 13, 
  markers = [], 
  heatmapData = [] 
}: { 
  center?: [number, number];
  zoom?: number;
  markers?: Array<{lat: number; lng: number; popup?: string}>;
  heatmapData?: Array<{lat: number; lng: number; color: string; popup?: string}>;
}) {
  return (
    <div style={{ height: '100%', width: '100%', borderRadius: 'inherit', zIndex: 1 }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        <Recenter center={center} />
        {markers.map((m, i) => (
          <Marker key={i} position={[m.lat, m.lng]}>
            {m.popup ? <Popup>{m.popup}</Popup> : null}
          </Marker>
        ))}
        {heatmapData.map((h, i) => (
          <CircleMarker 
            key={'heat' + i} 
            center={[h.lat, h.lng]} 
            radius={25} 
            pathOptions={{ color: h.color, fillColor: h.color, fillOpacity: 0.5, stroke: false }}
          >
            {h.popup ? <Popup>{h.popup}</Popup> : null}
          </CircleMarker>
        ))}
      </MapContainer>
      <style>{`
         .map-tiles { filter: invert(90%) hue-rotate(180deg) brightness(80%) contrast(120%); } /* Dark mode trick */
      `}</style>
    </div>
  );
}
