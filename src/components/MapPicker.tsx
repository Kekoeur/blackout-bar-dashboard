// apps/bar-dashboard/src/components/MapPicker.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet
const createCustomIcon = () => {
  if (typeof window === 'undefined') return null;
  
  return L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

interface MapPickerProps {
  initialLat?: number;
  initialLon?: number;
  onLocationChange: (lat: number, lon: number) => void;
  address?: string;
}

function LocationMarker({ position, onPositionChange }: any) {
  const [markerPosition, setMarkerPosition] = useState(position);
  const map = useMap();

  useEffect(() => {
    if (position) {
      setMarkerPosition(position);
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setMarkerPosition(newPos);
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  const customIcon = createCustomIcon();

  if (!markerPosition || !customIcon) return null;

  return (
    <Marker 
      position={markerPosition}
      icon={customIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          const newPos: [number, number] = [position.lat, position.lng];
          setMarkerPosition(newPos);
          onPositionChange(position.lat, position.lng);
        },
      }}
    >
      <Popup>
        <div style={{ padding: '8px' }}>
          <p style={{ fontWeight: 600, marginBottom: '4px', color: '#000' }}>
            Position du bar
          </p>
          <p style={{ fontSize: '12px', margin: '2px 0', color: '#666' }}>
            Lat: {markerPosition[0].toFixed(6)}
          </p>
          <p style={{ fontSize: '12px', margin: '2px 0', color: '#666' }}>
            Lon: {markerPosition[1].toFixed(6)}
          </p>
          <p style={{ fontSize: '12px', marginTop: '8px', color: '#2563eb' }}>
            💡 Glissez le marqueur pour ajuster
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapPicker({ 
  initialLat = 47.4724, 
  initialLon = -0.5513,
  onLocationChange,
  address 
}: MapPickerProps) {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLon]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (initialLat && initialLon) {
      setPosition([initialLat, initialLon]);
    }
  }, [initialLat, initialLon]);

  const handleLocationChange = (lat: number, lon: number) => {
    setPosition([lat, lon]);
    onLocationChange(lat, lon);
  };

  if (!isMounted) {
    return (
      <div className="h-[400px] bg-slate-700 rounded-lg flex items-center justify-center">
        <p className="text-slate-400">Chargement de la carte...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="h-[400px] rounded-lg overflow-hidden border-2 border-slate-600">
        <MapContainer
          center={position}
          zoom={15}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={position} 
            onPositionChange={handleLocationChange}
          />
        </MapContainer>
      </div>
      
      {address && (
        <div className="mt-2 text-xs text-slate-400 text-center">
          📍 {address}
        </div>
      )}
      
      <div className="mt-3 bg-slate-700/50 rounded-lg p-3 text-xs text-slate-300">
        <p className="mb-1">💡 <strong>Comment ajuster :</strong></p>
        <ul className="space-y-1 ml-4 list-disc">
          <li>Cliquez sur la carte pour déplacer le marqueur</li>
          <li>Ou glissez-déposez le marqueur directement</li>
          <li>Zoomez avec la molette ou les boutons +/-</li>
        </ul>
      </div>
    </div>
  );
}