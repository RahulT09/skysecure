/**
 * ExploreMap Component — Interactive Leaflet Map
 * Shows markers for: user location, tourist places, hotels, transport hubs.
 * Uses same dynamic-import pattern as FarmerMap.tsx.
 */
import { useEffect, useState, useRef } from 'react';
import { CuratedPlace } from '@/utils/curatedPlaces';
import { HotelResult, TransportResult } from '@/utils/exploreApi';

interface ExploreMapProps {
  lat: number;
  lon: number;
  userLat?: number;
  userLon?: number;
  places: CuratedPlace[];
  hotels: HotelResult[];
  transport: TransportResult[];
}

export function ExploreMap({ lat, lon, userLat, userLon, places, hotels, transport }: ExploreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapError, setMapError] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    // Cleanup previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initMap = async () => {
      try {
        const L = await import('leaflet');

        // Fix default marker icon paths
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Colored marker icons
        const createIcon = (color: string) =>
          new L.Icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          });

        const greenIcon = createIcon('green');
        const orangeIcon = createIcon('orange');
        const redIcon = createIcon('red');

        // Create map
        const map = L.map(mapRef.current!).setView([lat, lon], 13);
        mapInstanceRef.current = map;

        // OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // All coordinates for fitting bounds
        const allCoords: [number, number][] = [[lat, lon]];

        // User location marker (blue — default)
        L.marker([lat, lon])
          .addTo(map)
          .bindPopup('<strong>📍 Your Location</strong>')
          .openPopup();

        // Tourist place markers (green)
        places.forEach((place) => {
          const originLat = userLat ?? lat;
          const originLon = userLon ?? lon;
          const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.name)}&travelmode=driving`;
          L.marker([place.lat, place.lon], { icon: greenIcon })
            .addTo(map)
            .bindPopup(
              `<div style="font-family: 'Inter', sans-serif; min-width: 150px;">
                <strong>${place.emoji} ${place.name}</strong>
                <p style="font-size: 12px; color: #666; margin: 4px 0;">${place.description}</p>
                <span style="font-size: 11px; color: #10b981;">⭐ Popular Place</span>
                <br/>
                <a href="${dirUrl}" target="_blank" rel="noopener noreferrer"
                   style="display:inline-block; margin-top:6px; padding:4px 10px; background:#06b6d4; color:white; border-radius:8px; font-size:11px; font-weight:600; text-decoration:none;">
                  📍 Get Directions
                </a>
              </div>`
            );
          allCoords.push([place.lat, place.lon]);
        });

        // Hotel markers (orange)
        hotels.forEach((hotel) => {
          const originLat = userLat ?? lat;
          const originLon = userLon ?? lon;
          const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hotel.name)}&travelmode=driving`;
          L.marker([hotel.lat, hotel.lon], { icon: orangeIcon })
            .addTo(map)
            .bindPopup(
              `<div style="font-family: 'Inter', sans-serif; min-width: 150px;">
                <strong>🏨 ${hotel.name}</strong>
                <p style="font-size: 11px; color: #666; margin: 4px 0;">${hotel.address}</p>
                ${hotel.rating ? `<p style="font-size: 12px;">⭐ ${hotel.rating.toFixed(1)}</p>` : ''}
                <a href="${dirUrl}" target="_blank" rel="noopener noreferrer"
                   style="display:inline-block; margin-top:6px; padding:4px 10px; background:#3b82f6; color:white; border-radius:8px; font-size:11px; font-weight:600; text-decoration:none;">
                  📍 Get Directions
                </a>
              </div>`
            );
          allCoords.push([hotel.lat, hotel.lon]);
        });

        // Transport markers (red)
        transport.forEach((hub) => {
          const originLat = userLat ?? lat;
          const originLon = userLon ?? lon;
          const icon = hub.type === 'railway' ? '🚉' : '✈️';
          const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hub.name)}&travelmode=driving`;
          L.marker([hub.lat, hub.lon], { icon: redIcon })
            .addTo(map)
            .bindPopup(
              `<div style="font-family: 'Inter', sans-serif;">
                <strong>${icon} ${hub.name}</strong>
                <p style="font-size: 11px; color: #666; margin: 4px 0;">${hub.distance} away</p>
                <a href="${dirUrl}" target="_blank" rel="noopener noreferrer"
                   style="display:inline-block; margin-top:6px; padding:4px 10px; background:#10b981; color:white; border-radius:8px; font-size:11px; font-weight:600; text-decoration:none;">
                  📍 Directions
                </a>
              </div>`
            );
          allCoords.push([hub.lat, hub.lon]);
        });

        // Fit bounds to show all markers
        if (allCoords.length > 1) {
          const bounds = L.latLngBounds(allCoords.map(([lt, ln]) => [lt, ln]));
          map.fitBounds(bounds, { padding: [40, 40] });
        }

        setMapLoaded(true);
      } catch (err) {
        console.error('Explore map initialization error:', err);
        setMapError(true);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon, places, hotels, transport]);

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 animate-slide-up">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
        🗺️ Explore Map
      </h2>

      {/* Map error fallback */}
      {mapError && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-2xl">⚠️</span>
          <p className="text-sm text-white/70">Map could not be loaded</p>
        </div>
      )}

      {/* Map container */}
      {!mapError && (
        <div className="relative rounded-2xl overflow-hidden border border-white/10" style={{ height: '400px' }}>
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/5">
              <p className="text-white/50 animate-pulse">Loading map...</p>
            </div>
          )}
          <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-white/50">
        <span className="flex items-center gap-1">📍 Your Location</span>
        <span className="flex items-center gap-1">🟢 Attractions</span>
        <span className="flex items-center gap-1">🟠 Hotels</span>
        <span className="flex items-center gap-1">🔴 Transport</span>
      </div>
    </div>
  );
}
