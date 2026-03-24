import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';

interface FarmerMapProps {
  lat: number;
  lon: number;
}

// ─── Mock mandi locations (offsets from user position) ───
function getMockMandis(lat: number, lon: number) {
  return [
    { name: 'Krishi Mandi', nameHi: 'कृषि मंडी',  lat: lat + 0.015, lon: lon + 0.02  },
    { name: 'Sabzi Mandi',  nameHi: 'सब्जी मंडी', lat: lat - 0.01,  lon: lon + 0.015 },
    { name: 'Anaj Mandi',   nameHi: 'अनाज मंडी',  lat: lat + 0.008, lon: lon - 0.018 },
    { name: 'Phal Mandi',   nameHi: 'फल मंडी',     lat: lat - 0.02,  lon: lon - 0.01  },
  ];
}

/**
 * Fetch driving route from OSRM (free, no API key)
 * Returns an array of [lat, lon] coordinates for the route polyline
 */
async function fetchRoute(
  fromLat: number, fromLon: number,
  toLat: number, toLon: number
): Promise<[number, number][]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`;
    const response = await axios.get(url, { timeout: 8000 });
    const coords = response.data?.routes?.[0]?.geometry?.coordinates;
    if (coords) {
      // OSRM returns [lon, lat] — flip to [lat, lon] for Leaflet
      return coords.map((c: [number, number]) => [c[1], c[0]]);
    }
    return [];
  } catch {
    console.warn('OSRM route fetch failed, drawing straight line');
    return [];
  }
}

/**
 * Build Google Maps directions URL for navigation
 */
function getGoogleMapsUrl(fromLat: number, fromLon: number, toLat: number, toLon: number): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLon}&destination=${toLat},${toLon}&travelmode=driving`;
}

/**
 * FarmerMap Component
 * Interactive Leaflet map showing user location, mandi markers,
 * driving routes (via OSRM), and "Navigate" buttons.
 */
export function FarmerMap({ lat, lon }: FarmerMapProps) {
  const { lang, t } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapError, setMapError] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeRoute, setActiveRoute] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Cleanup previous map if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const routeLayersRef: any[] = [];

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

        // Green icon for mandis
        const mandiIcon = new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        // Create map
        const map = L.map(mapRef.current!).setView([lat, lon], 13);
        mapInstanceRef.current = map;

        // OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // User location marker (blue)
        L.marker([lat, lon])
          .addTo(map)
          .bindPopup(`<strong>📍 ${t('map.your_location')}</strong>`)
          .openPopup();

        // ─── Add mandi markers with route + navigate buttons ───
        const mandis = getMockMandis(lat, lon);
        const allCoords: [number, number][] = [[lat, lon]];

        mandis.forEach((mandi) => {
          const mandiName = lang === 'hi' ? mandi.nameHi : mandi.name;
          const directionsLabel = lang === 'hi' ? 'रास्ता दिखाएं' : 'Show Route';
          const navigateLabel = lang === 'hi' ? '📱 नेविगेट करें' : '📱 Navigate';
          const googleUrl = getGoogleMapsUrl(lat, lon, mandi.lat, mandi.lon);

          // Popup HTML with route and navigate buttons
          const popupHtml = `
            <div style="min-width: 160px; font-family: 'Inter', sans-serif;">
              <strong style="font-size: 14px;">🏪 ${mandiName}</strong>
              <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 6px;">
                <button
                  onclick="window.__showRoute__('${mandi.name}', ${mandi.lat}, ${mandi.lon})"
                  style="
                    background: #10b981; color: white; border: none; padding: 6px 12px;
                    border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;
                    display: flex; align-items: center; gap: 4px; justify-content: center;
                  "
                >
                  🛣️ ${directionsLabel}
                </button>
                <a
                  href="${googleUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    background: #3b82f6; color: white; text-decoration: none; padding: 6px 12px;
                    border-radius: 8px; font-size: 12px; font-weight: 600; text-align: center;
                    display: flex; align-items: center; gap: 4px; justify-content: center;
                  "
                >
                  ${navigateLabel}
                </a>
              </div>
            </div>
          `;

          L.marker([mandi.lat, mandi.lon], { icon: mandiIcon })
            .addTo(map)
            .bindPopup(popupHtml, { maxWidth: 220 });

          allCoords.push([mandi.lat, mandi.lon]);
        });

        // ─── Global function to draw route on map ───
        (window as any).__showRoute__ = async (mandiName: string, mandiLat: number, mandiLon: number) => {
          // Clear existing route layers
          routeLayersRef.forEach((layer) => map.removeLayer(layer));
          routeLayersRef.length = 0;

          setActiveRoute(mandiName);

          // Fetch real route from OSRM
          const routeCoords = await fetchRoute(lat, lon, mandiLat, mandiLon);

          if (routeCoords.length > 0) {
            // Draw the route polyline
            const polyline = L.polyline(routeCoords as L.LatLngExpression[], {
              color: '#10b981',
              weight: 5,
              opacity: 0.8,
              dashArray: '10, 6',
            }).addTo(map);
            routeLayersRef.push(polyline);

            // Fit map to show the full route
            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
          } else {
            // Fallback: draw a straight dashed line
            const line = L.polyline(
              [[lat, lon], [mandiLat, mandiLon]],
              { color: '#f59e0b', weight: 3, opacity: 0.7, dashArray: '8, 8' }
            ).addTo(map);
            routeLayersRef.push(line);

            map.fitBounds(line.getBounds(), { padding: [50, 50] });
          }
        };

        // Fit bounds to show all markers
        const bounds = L.latLngBounds(allCoords.map(([lt, ln]) => [lt, ln]));
        map.fitBounds(bounds, { padding: [40, 40] });

        setMapLoaded(true);
      } catch (err) {
        console.error('Map initialization error:', err);
        setMapError(true);
      }
    };

    initMap();

    return () => {
      // Cleanup global function
      delete (window as any).__showRoute__;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon, lang, t]);

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 animate-slide-up">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
        🗺️ {t('map.title')}
      </h2>

      {/* Active route indicator */}
      {activeRoute && (
        <div className="flex items-center gap-2 mb-3 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25">
          <span className="text-sm">🛣️</span>
          <p className="text-sm text-emerald-300 font-medium">
            {lang === 'hi' ? `${activeRoute} तक रास्ता` : `Route to ${activeRoute}`}
          </p>
          <button
            onClick={() => {
              setActiveRoute(null);
              // Re-initialize map to clear route
              if (mapInstanceRef.current) {
                const mandis = getMockMandis(lat, lon);
                const allCoords: [number, number][] = [[lat, lon], ...mandis.map(m => [m.lat, m.lon] as [number, number])];
                const L = (window as any).L;
                if (L) {
                  const bounds = L.latLngBounds(allCoords);
                  mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
                }
              }
            }}
            className="ml-auto text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Map error fallback */}
      {mapError && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-2xl">⚠️</span>
          <p className="text-sm text-white/70">
            {lang === 'hi' ? 'मानचित्र लोड नहीं हो सका' : 'Map could not be loaded'}
          </p>
        </div>
      )}

      {/* Map container */}
      {!mapError && (
        <div className="relative rounded-2xl overflow-hidden border border-white/10" style={{ height: '400px' }}>
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/5">
              <p className="text-white/50 animate-pulse">{t('loading')}</p>
            </div>
          )}
          <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-white/50">
        <span className="flex items-center gap-1">📍 {lang === 'hi' ? 'आपका स्थान' : 'Your Location'}</span>
        <span className="flex items-center gap-1">🟢 {lang === 'hi' ? 'मंडियाँ' : 'Mandis'}</span>
        <span className="flex items-center gap-1">🛣️ {lang === 'hi' ? 'रास्ते' : 'Routes'}</span>
      </div>
    </div>
  );
}
