/**
 * Transport Component — Nearby Railway Stations & Airports Card
 * Fetches transport hub data from Foursquare API (or uses mock data).
 */
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { TransportResult, fetchNearbyTransport, getDirectionsUrl } from '@/utils/exploreApi';

interface TransportProps {
  lat: number;
  lon: number;
  userLat?: number;
  userLon?: number;
}

export function Transport({ lat, lon, userLat, userLon }: TransportProps) {
  const [transport, setTransport] = useState<TransportResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetchNearbyTransport(lat, lon).then((data) => {
      if (!cancelled) {
        setTransport(data);
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [lat, lon]);

  // Split by type for display
  const railways = transport.filter((t) => t.type === 'railway');
  const airports = transport.filter((t) => t.type === 'airport');

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 animate-slide-up">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
        🚉 Nearby Transport
      </h2>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
          <span className="ml-3 text-sm text-white/50">Finding transport hubs...</span>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-4">
          {/* Railway Stations */}
          {railways.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white/70 mb-2 flex items-center gap-1.5">
                🚂 Railway Stations
              </h3>
              <div className="grid gap-2">
                {railways.map((station) => (
                  <div
                    key={station.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10
                               hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg">🚉</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{station.name}</p>
                        <p className="text-xs text-white/40">{station.distance} away</p>
                      </div>
                    </div>
                    <a
                      href={getDirectionsUrl(userLat ?? lat, userLon ?? lon, station.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300
                                 border border-emerald-400/30 text-xs font-semibold
                                 hover:bg-emerald-500/30 transition-colors"
                    >
                      📍 Directions
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Airports */}
          {airports.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white/70 mb-2 flex items-center gap-1.5">
                ✈️ Airports
              </h3>
              <div className="grid gap-2">
                {airports.map((airport) => (
                  <div
                    key={airport.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10
                               hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg">✈️</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{airport.name}</p>
                        <p className="text-xs text-white/40">{airport.distance} away</p>
                      </div>
                    </div>
                    <a
                      href={getDirectionsUrl(userLat ?? lat, userLon ?? lon, airport.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300
                                 border border-blue-400/30 text-xs font-semibold
                                 hover:bg-blue-500/30 transition-colors"
                    >
                      📍 Directions
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && transport.length === 0 && (
        <p className="text-white/40 text-sm text-center py-6">
          No transport hubs found nearby.
        </p>
      )}
    </div>
  );
}
