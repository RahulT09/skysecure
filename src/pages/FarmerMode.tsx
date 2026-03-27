import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { WeatherData } from '@/types/weather';
import { getUserLocation } from '@/utils/weatherApi';
import { fetchFarmerWeather, reverseGeocode } from '@/utils/farmerWeatherApi';
import { getMockWeatherData } from '@/utils/mockWeather';
import { useLanguage } from '@/contexts/LanguageContext';
import { CropSuggestionCard } from '@/components/farmer/CropSuggestion';
import { SoilInfo } from '@/components/farmer/SoilInfo';
import { MarketPrices } from '@/components/farmer/MarketPrices';
import { FarmerMap } from '@/components/farmer/FarmerMap';
import { LanguageToggle } from '@/components/farmer/LanguageToggle';

/**
 * Farmer Mode Dashboard Page
 * A complete agricultural assistant view with crop suggestions,
 * soil data, market prices, and an interactive map.
 *
 * Uses Open-Meteo API directly (FREE, no API key) instead of Supabase
 * edge functions, so weather data always loads reliably.
 */
const FarmerMode = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // ─── State ───
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationName, setLocationName] = useState('');

  // ─── Fetch weather using Open-Meteo (free, reliable) ───
  const loadWeather = useCallback(async () => {
    setIsLoading(true);

    // Default fallback coordinates (Mumbai)
    const defaultCoords = { lat: 19.076, lon: 72.8777 };

    try {
      // Try to get user's real location first
      const userCoords = await getUserLocation();
      const activeCoords = userCoords || defaultCoords;
      setCoords(activeCoords);

      // Fetch weather directly from Open-Meteo (no Supabase needed)
      const data = await fetchFarmerWeather(activeCoords.lat, activeCoords.lon);
      setWeather(data);

      // Get a proper location name via reverse geocoding
      const name = await reverseGeocode(activeCoords.lat, activeCoords.lon);
      setLocationName(name);
    } catch (err) {
      console.error('Farmer weather fetch failed:', err);
      // Complete failure — use mock data
      setCoords(defaultCoords);
      const mock = getMockWeatherData('Mumbai, India');
      setWeather(mock);
      setLocationName('Mumbai, India');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  return (
    <div className="min-h-screen"
         style={{ background: 'linear-gradient(160deg, hsl(142 45% 22%) 0%, hsl(160 40% 18%) 40%, hsl(180 35% 15%) 100%)' }}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-600/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-3xl font-sans">
        {/* ─── Header ─── */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 backdrop-blur-md flex items-center justify-center border border-emerald-400/30">
              <Sprout className="w-7 h-7 text-emerald-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[22px] tracking-tight text-white leading-tight">
                {t('dashboard.title')}
              </span>
              <span className="text-sm font-medium text-white/60 leading-tight">
                {t('dashboard.subtitle')}
              </span>
            </div>
          </div>
          <LanguageToggle />
        </header>

        {/* ─── Back navigation ─── */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                     bg-white/10 backdrop-blur-md border border-white/20 text-white/80
                     hover:bg-white/20 hover:text-white transition-all duration-300"
        >
          {t('nav.back')}
        </button>

        {/* ─── Loading state ─── */}
        {isLoading && (
          <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20
                            flex items-center justify-center animate-pulse">
              <span className="text-3xl">🌾</span>
            </div>
            <p className="text-white/80 font-medium">{t('loading')}</p>
          </div>
        )}

        {/* ─── Dashboard content ─── */}
        {!isLoading && weather && coords && (
          <div className="flex flex-col gap-5">

            {/* Weather Summary Card */}
            <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📍</span>
                <div>
                  <h2 className="text-lg font-bold text-white">{locationName}</h2>
                  <p className="text-xs text-white/50">
                    {coords.lat.toFixed(4)}°, {coords.lon.toFixed(4)}°
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <WeatherMetric
                  label={t('weather.temperature')}
                  value={`${weather.temperature}°C`}
                  emoji="🌡️"
                />
                <WeatherMetric
                  label={t('weather.humidity')}
                  value={`${weather.humidity}%`}
                  emoji="💧"
                />
                <WeatherMetric
                  label={t('weather.rain')}
                  value={`${weather.rainProbability}%`}
                  emoji="🌧️"
                />
                <WeatherMetric
                  label={t('weather.wind')}
                  value={`${weather.windSpeed} km/h`}
                  emoji="💨"
                />
              </div>
            </div>

            {/* Crop Suggestions */}
            <CropSuggestionCard
              temperature={weather.temperature}
              humidity={weather.humidity}
              rainfall={weather.rainProbability}
            />

            {/* Soil Information */}
            <SoilInfo lat={coords.lat} lon={coords.lon} />

            {/* Market Prices */}
            <MarketPrices />

            {/* Interactive Map */}
            <FarmerMap lat={coords.lat} lon={coords.lon} locationName={locationName} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm opacity-80">
          <p className="font-medium">
            <span className="tracking-[0.15em]">SkySecure</span> — {t('dashboard.subtitle')}
          </p>
          <p className="mt-1 text-xs opacity-70">Made with ❤️ for Indian farmers</p>
        </footer>
      </div>
    </div>
  );
};

// ─── Small weather metric card ───
function WeatherMetric({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/5 border border-white/10">
      <span className="text-xl">{emoji}</span>
      <span className="text-lg font-bold text-white">{value}</span>
      <span className="text-xs text-white/50 text-center">{label}</span>
    </div>
  );
}

export default FarmerMode;
