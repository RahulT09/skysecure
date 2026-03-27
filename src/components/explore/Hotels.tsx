/**
 * Hotels Component — Nearby Hotels Card
 * Fetches hotel data from Foursquare API (or uses mock data).
 * Shows image, name, rating, and Google Maps directions link.
 */
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { HotelResult, fetchNearbyHotels, getDirectionsUrl } from '@/utils/exploreApi';

interface HotelsProps {
  lat: number;
  lon: number;
  userLat?: number;
  userLon?: number;
}

export function Hotels({ lat, lon, userLat, userLon }: HotelsProps) {
  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetchNearbyHotels(lat, lon).then((data) => {
      if (!cancelled) {
        setHotels(data);
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [lat, lon]);

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 animate-slide-up">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
        🏨 Nearby Hotels
      </h2>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
          <span className="ml-3 text-sm text-white/50">Finding nearby hotels...</span>
        </div>
      )}

      {/* Hotel cards grid */}
      {!isLoading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden
                         hover:bg-white/10 transition-all duration-300 group"
            >
              {/* Hotel image */}
              <div className="relative h-32 overflow-hidden">
                <img
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Rating badge */}
                <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm
                                text-xs font-bold text-white flex items-center gap-1">
                  ⭐ {hotel.rating ? hotel.rating.toFixed(1) : 'Recommended'}
                </div>
              </div>

              {/* Hotel info */}
              <div className="p-3">
                <h3 className="text-sm font-bold text-white truncate">{hotel.name}</h3>
                <p className="text-xs text-white/40 mt-0.5 truncate">{hotel.address}</p>

                {/* Directions button */}
                <a
                  href={getDirectionsUrl(userLat ?? lat, userLon ?? lon, hotel.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-center gap-1.5 w-full px-3 py-2
                             rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30
                             text-xs font-semibold hover:bg-blue-500/30 transition-colors"
                >
                  📍 Get Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && hotels.length === 0 && (
        <p className="text-white/40 text-sm text-center py-6">
          No hotels found nearby.
        </p>
      )}
    </div>
  );
}
