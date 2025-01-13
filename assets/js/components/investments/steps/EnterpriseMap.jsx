import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const EnterpriseMap = ({ address }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initMap = async () => {
      if (!address || !containerRef.current) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Vérification de la validité minimale de l'adresse
        if (!address.codePostal || !address.commune) {
          throw new Error('Adresse insuffisante pour l\'affichage de la carte');
        }

        // Nettoyage de la carte existante
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        // Création du conteneur de la carte
        const mapContainer = containerRef.current;
        mapContainer.innerHTML = '<div id="map" style="height: 100%; width: 100%;"></div>';
        const mapElement = mapContainer.firstChild;

        // Construction de l'adresse complète
        const addressParts = [];
        if (address.numVoie) addressParts.push(address.numVoie);
        if (address.typeVoie) addressParts.push(address.typeVoie);
        if (address.voie) addressParts.push(address.voie);
        addressParts.push(address.codePostal);
        addressParts.push(address.commune);
        addressParts.push('France');

        // Première tentative avec l'adresse complète
        let query = addressParts.join(' ');
        let response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=fr&limit=1`
        );
        let data = await response.json();

        // Si pas de résultat, essayer avec une version simplifiée
        if (!data || data.length === 0) {
          query = `${address.typeVoie} ${address.voie} ${address.commune} ${address.codePostal} France`;
          response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=fr&limit=1`
          );
          data = await response.json();
        }

        // Si toujours pas de résultat, essayer avec juste la commune et le code postal
        if (!data || data.length === 0) {
          query = `${address.commune} ${address.codePostal} France`;
          response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=fr&limit=1`
          );
          data = await response.json();
        }

        if (!data || data.length === 0) {
          throw new Error('Localisation impossible pour cette adresse');
        }

        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        // Création de la nouvelle carte avec mapElement
        const map = L.map(mapElement, {
          center: [lat, lng],
          zoom: 13,
          zoomControl: false,
          attributionControl: false,
          dragging: true,
          touchZoom: true,
          doubleClickZoom: true,
          scrollWheelZoom: true,
          boxZoom: true,
          keyboard: true,
          tap: true,
          bounceAtZoomLimits: true,
          maxBoundsViscosity: 1.0
        });

        mapRef.current = map;

        L.control.zoom({
          position: 'topright'
        }).addTo(map);

        L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
          maxZoom: 20
        }).addTo(map);

        // Création du marqueur personnalisé avec les nouvelles couleurs
        const customIcon = L.divIcon({
          className: 'custom-marker-container',
          html: `
            <div class="marker-pin"></div>
            <div class="marker-pulse"></div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        // Styles mis à jour avec les nouvelles couleurs
        const styles = document.createElement('style');
        styles.textContent = `
          .custom-marker-container {
            position: relative;
            width: 40px;
            height: 40px;
          }
          .marker-pin {
            width: 24px;
            height: 24px;
            background: #297CF7;
            border: 3px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 3px 6px rgba(0,0,0,0.3);
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2;
          }
          .marker-pulse {
            width: 40px;
            height: 40px;
            background: rgba(41, 124, 247, 0.2);
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(1.5);
              opacity: 0;
            }
          }
          .custom-popup .leaflet-popup-content-wrapper {
            background: #FFFFFF;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            overflow: hidden;
          }
          .custom-popup .leaflet-popup-content {
            margin: 0;
            min-width: 200px;
          }
          .custom-popup .leaflet-popup-tip {
            background: #FFFFFF;
          }
          .custom-popup .leaflet-popup-close-button {
            position: absolute;
            right: 12px;
            top: 12px;
            color: #FFFFFF !important;
            font-size: 20px;
            font-weight: bold;
            background: transparent;
            border: none;
            z-index: 1;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
            transition: transform 0.2s;
          }
          .custom-popup .leaflet-popup-close-button:hover {
            transform: scale(1.1);
            color: #FFFFFF !important;
          }
          .custom-popup .leaflet-popup-close-button span {
            color: #FFFFFF !important;
          }
          .popup-content {
            font-family: system-ui, -apple-system, sans-serif;
          }
          .popup-header {
            background: #297CF7;
            color: white;
            padding: 12px 16px;
            font-weight: 500;
          }
          .popup-body {
            padding: 12px 16px;
          }
          .popup-address {
            color: #313847;
            font-weight: 500;
            margin-bottom: 4px;
          }
          .popup-city {
            color: #8AAAD9;
          }
        `;
        document.head.appendChild(styles);

        L.marker([lat, lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div class="popup-content">
              <div class="popup-header">
                Adresse
              </div>
              <div class="popup-body">
                <div class="popup-address">
                  ${address.numVoie ? `${address.numVoie} ` : ''}${address.typeVoie || ''} ${address.voie || ''}
                </div>
                <div class="popup-city">
                  ${address.codePostal || ''} ${address.commune || ''}
                </div>
              </div>
            </div>
          `, {
            className: 'custom-popup',
            closeButton: true,
            autoClose: false,
            closeOnClick: false
          })
          .openPopup();

        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de l\'initialisation de la carte:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [address]);

  return (
    <div className="relative w-full h-[300px] rounded-lg overflow-hidden shadow-lg">
      {loading && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <span className="text-gray-600">Chargement de la carte...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-10">
          <span className="text-red-500">{error}</span>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
};

export default EnterpriseMap; 