'use client';

import 'leaflet/dist/leaflet.css';

import L, { LatLngTuple } from 'leaflet';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

import { useTranslation } from '@/app/i18n/client';
import customMarkerIcon from '/public/images/icon/map-marker.svg';

const CustomIcon = L.icon({
  iconUrl: customMarkerIcon.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapOne = ({ lng }: { lng: string }) => {
  const { t } = useTranslation(lng, 'dashboard');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // ou un loader, ou un message d'attente
  }

  const positions: { name: string; position: LatLngTuple }[] = [
    { name: 'NeuroTech AI', position: [48.8566, 2.3522] },
    { name: 'EcoDrive Innovations', position: [51.5074, -0.1278] },
    { name: 'Quantum Solutions', position: [40.7128, -74.006] },
  ];

  return (
    <div className="p-4 shadow-lg rounded-lg bg-white">
      <h2 className="text-xl font-semibold mb-4">
        {t('geographical_distribution')}
      </h2>
      <MapContainer
        center={[20, 0] as LatLngTuple}
        zoom={2}
        style={{ height: '400px', width: '100%', zIndex: 10 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {positions.map((pos, idx) => (
          <Marker key={idx} position={pos.position} icon={CustomIcon}>
            <Popup>{pos.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapOne;
