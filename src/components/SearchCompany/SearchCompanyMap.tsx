'use client';

import 'leaflet/dist/leaflet.css';

import { Spin } from 'antd';
import L from 'leaflet';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import customMarkerIcon from '/public/images/icon/map-marker.svg';
import mapNonCharge from '/public/images/icon/map-non-charge.jpg';

const DynamicMapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false },
);
const DynamicTileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false },
);
const DynamicMarker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false },
);
const DynamicPopup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false },
);

const markerIcon = L.icon({
  iconUrl: customMarkerIcon.src,
  iconSize: [35, 50],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const fetchCoordinates = async (address: string) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
  );
  const data = await response.json();
  if (data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  }
  return null;
};

const SearchCompanyMap = ({ address }: { address: string }) => {
  const { t } = useTranslation('search-company');
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCoordinates = async () => {
      const coords = await fetchCoordinates(address);
      setCoordinates(coords);
      setLoading(false);
    };

    getCoordinates();
  }, [address]);

  const bounds = coordinates
    ? L.latLngBounds(
        [coordinates.lat - 0.1, coordinates.lon - 0.1],
        [coordinates.lat + 0.1, coordinates.lon + 0.1],
      )
    : undefined;

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Spin />
      </div>
    );
  }

  return coordinates ? (
    <DynamicMapContainer
      key={address}
      center={[coordinates.lat, coordinates.lon]}
      zoom={13}
      minZoom={2}
      maxBounds={bounds}
      maxBoundsViscosity={1.0}
      style={{ height: '100%', width: '100%' }}
      className="rounded-3xl"
    >
      <DynamicTileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <DynamicMarker
        position={[coordinates.lat, coordinates.lon]}
        icon={markerIcon}
      >
        <DynamicPopup>{address}</DynamicPopup>
      </DynamicMarker>
    </DynamicMapContainer>
  ) : (
    <div className="h-full w-full flex items-center justify-center relative">
      <Image
        width={0}
        height={0}
        sizes="100vw"
        className="rounded-3xl"
        style={{ width: '100%', height: 'auto' }}
        src={mapNonCharge.src}
        alt={t('map_error')}
      />
      <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold bg-black bg-opacity-50 rounded-3xl">
        {t('map_error')}
      </div>
    </div>
  );
};

export default SearchCompanyMap;
