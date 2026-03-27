/**
 * Places Component — Top Attractions Card
 * Displays curated tourist places from local dataset.
 * Supports weather-based filtering (rainy → indoor first).
 */
import { CuratedPlace } from '@/utils/curatedPlaces';
import { getDirectionsUrl } from '@/utils/exploreApi';

interface PlacesProps {
  lat: number;
  lon: number;
  places: CuratedPlace[];
  weatherCondition?: string; // 'rainy' | 'sunny' | etc.
}

export function Places({ lat, lon, places, weatherCondition }: PlacesProps) {
  // Weather-based sorting: rain → indoor first, sunny → outdoor first
  const sortedPlaces = [...places].sort((a, b) => {
    if (weatherCondition === 'rainy' || weatherCondition === 'stormy') {
      if (a.type === 'indoor' && b.type !== 'indoor') return -1;
      if (a.type !== 'indoor' && b.type === 'indoor') return 1;
    }
    if (weatherCondition === 'sunny') {
      if (a.type === 'outdoor' && b.type !== 'outdoor') return -1;
      if (a.type !== 'outdoor' && b.type === 'outdoor') return 1;
    }
    return 0;
  });

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 animate-slide-up">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
        🏛️ Top Attractions
      </h2>

      {/* Weather filter hint */}
      {(weatherCondition === 'rainy' || weatherCondition === 'stormy') && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-blue-500/15 border border-blue-400/25">
          <span className="text-sm">🌧️</span>
          <p className="text-xs text-blue-200 font-medium">
            Rainy weather detected — showing indoor places first
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {sortedPlaces.map((place, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10
                       hover:bg-white/10 transition-all duration-300 group"
          >
            {/* Emoji icon */}
            <span className="text-2xl mt-0.5 group-hover:scale-110 transition-transform">
              {place.emoji}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white">{place.name}</h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    place.type === 'indoor'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  }`}
                >
                  {place.type === 'indoor' ? '🏠 Indoor' : '🌤️ Outdoor'}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">{place.description}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/20 font-medium">
                  ⭐ Popular Place
                </span>
                <a
                  href={getDirectionsUrl(lat, lon, place.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-semibold hover:bg-cyan-500/30 transition-colors"
                >
                  📍 Directions
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {places.length === 0 && (
        <p className="text-white/40 text-sm text-center py-6">
          No attractions data available for this location.
        </p>
      )}
    </div>
  );
}
