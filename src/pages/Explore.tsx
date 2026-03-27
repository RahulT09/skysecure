/**
 * Explore Dashboard Page
 * Reads city, lat, lon from URL search params.
 * Renders: header → back button → Places → Hotels → Transport → Map
 * Uses a blue/cyan travel theme with glassmorphism cards (like FarmerMode).
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { curatedPlaces, CuratedPlace } from '@/utils/curatedPlaces';
import { HotelResult, TransportResult, fetchNearbyHotels, fetchNearbyTransport } from '@/utils/exploreApi';
import { getUserLocation } from '@/utils/weatherApi';
import { Places } from '@/components/explore/Places';
import { Hotels } from '@/components/explore/Hotels';
import { Transport } from '@/components/explore/Transport';
import { ExploreMap } from '@/components/explore/ExploreMap';

const Explore = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read query params
  const city = searchParams.get('city') || 'mumbai';
  const lat = parseFloat(searchParams.get('lat') || '19.076');
  const lon = parseFloat(searchParams.get('lon') || '72.8777');

  const cityName = city.charAt(0).toUpperCase() + city.slice(1);

  // ─── State ───
  const [places, setPlaces] = useState<CuratedPlace[]>([]);
  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [transport, setTransport] = useState<TransportResult[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Load data ───
  const loadData = useCallback(async () => {
    setIsLoading(true);

    // Curated places (local dataset)
    const cityData = curatedPlaces[city.toLowerCase()];
    setPlaces(cityData?.places || []);

    // Fetch hotels & transport in parallel, as well as live user location
    try {
      const [hotelData, transportData, liveLocation] = await Promise.all([
        fetchNearbyHotels(lat, lon),
        fetchNearbyTransport(lat, lon),
        getUserLocation(),
      ]);
      setHotels(hotelData);
      setTransport(transportData);
      setUserLocation(liveLocation);
    } catch (err) {
      console.error('Error loading explore data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [city, lat, lon]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(160deg, hsl(200 50% 18%) 0%, hsl(210 45% 15%) 40%, hsl(220 40% 12%) 100%)',
      }}
    >
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-3xl font-sans">
        {/* ─── Header ─── */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 backdrop-blur-md flex items-center justify-center border border-cyan-400/30">
              <Compass className="w-7 h-7 text-cyan-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[22px] tracking-tight text-white leading-tight">
                Smart Explorer
              </span>
              <span className="text-sm font-medium text-white/60 leading-tight">
                Discover & Navigate
              </span>
            </div>
          </div>
        </header>

        {/* ─── Back navigation ─── */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                     bg-white/10 backdrop-blur-md border border-white/20 text-white/80
                     hover:bg-white/20 hover:text-white transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Weather
        </button>

        {/* ─── City Info Card ─── */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 mb-5 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📍</span>
            <div>
              <h2 className="text-lg font-bold text-white">{cityName}</h2>
              <p className="text-xs text-white/50">
                {lat.toFixed(4)}°, {lon.toFixed(4)}°
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xl">🏛️</span>
              <span className="text-lg font-bold text-white">{places.length}</span>
              <span className="text-xs text-white/50 text-center">Attractions</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xl">🏨</span>
              <span className="text-lg font-bold text-white">{hotels.length}</span>
              <span className="text-xs text-white/50 text-center">Hotels</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xl">🚉</span>
              <span className="text-lg font-bold text-white">{transport.length}</span>
              <span className="text-xs text-white/50 text-center">Transport</span>
            </div>
          </div>
        </div>

        {/* ─── Loading state ─── */}
        {isLoading && (
          <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/20
                            flex items-center justify-center animate-pulse">
              <span className="text-3xl">🧭</span>
            </div>
            <p className="text-white/80 font-medium">Loading explore data for {cityName}...</p>
          </div>
        )}

        {/* ─── Dashboard sections ─── */}
        {!isLoading && (
          <div className="flex flex-col gap-5">
            {/* Top Attractions */}
            <Places lat={userLocation?.lat ?? lat} lon={userLocation?.lon ?? lon} places={places} />

            {/* Nearby Hotels */}
            <Hotels lat={lat} lon={lon} userLat={userLocation?.lat ?? lat} userLon={userLocation?.lon ?? lon} />

            {/* Transport Hubs */}
            <Transport lat={lat} lon={lon} userLat={userLocation?.lat ?? lat} userLon={userLocation?.lon ?? lon} />

            {/* Interactive Map */}
            <ExploreMap
              lat={lat}
              lon={lon}
              userLat={userLocation?.lat}
              userLon={userLocation?.lon}
              places={places}
              hotels={hotels}
              transport={transport}
            />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm opacity-80">
          <p className="font-medium">
            <span className="tracking-[0.15em]">SkySecure</span> — Smart Travel Explorer
          </p>
          <p className="mt-1 text-xs opacity-70">Made with ❤️ for travelers</p>
        </footer>
      </div>
    </div>
  );
};

export default Explore;
