import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Sprout } from 'lucide-react';
import { WeatherData, AppMode, ChatMessage } from '@/types/weather';
import { fetchWeatherData, fetchWeatherByLocation, getUserLocation } from '@/utils/weatherApi';
import { getMockWeatherData } from '@/utils/mockWeather';
import { generateWeatherAdvice } from '@/utils/weatherAdvice';
import { getWeatherTheme } from '@/utils/weatherBackground';
import { Header } from '@/components/Header';
import { LocationSearch } from '@/components/LocationSearch';
import { WeatherCard } from '@/components/WeatherCard';
import { ModeToggle } from '@/components/ModeToggle';
import { ChatAssistant } from '@/components/ChatAssistant';
import { WeatherParticles } from '@/components/WeatherParticles';
import { LocalGuideChat } from '@/components/LocalGuideChat';
import { WeeklyForecast } from '@/components/WeeklyForecast';
import { SunTimeline } from '@/components/SunTimeline';
import { SunUvMetrics } from '@/components/SunUvMetrics';
import { ExtraMetrics } from '@/components/ExtraMetrics';
import { FloatingAiChat } from '@/components/FloatingAiChat';
import { AiAnalysisBanner } from '@/components/AiAnalysisBanner';
import { useToast } from '@/hooks/use-toast';
/**
 * Main Weather App Component
 * Fetches real weather data from OpenWeatherMap API via secure backend
 */
const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State management
  const [location, setLocation] = useState<string>('Mumbai, India');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [mode, setMode] = useState<AppMode>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  /**
   * Fetch weather data from the API
   */
  const fetchWeather = useCallback(async (searchLocation?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchWeatherData(searchLocation || location);
      setWeather(data);
      setLocation(data.location); // Update with formatted location from API
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      setError(err.message);
      
      // Show error toast and fall back to mock data
      toast({
        title: "Couldn't fetch live weather",
        description: "Showing sample data. Check your API key or try another city.",
        variant: "destructive",
      });
      
      // Use mock data as fallback
      const mockData = getMockWeatherData(searchLocation || location);
      setWeather(mockData);
    } finally {
      setIsLoading(false);
    }
  }, [location, toast]);

  /**
   * Try to get user's location on first load
   */
  useEffect(() => {
    const initializeWeather = async () => {
      const coords = await getUserLocation();
      
      if (coords) {
        try {
          setIsLoading(true);
          const data = await fetchWeatherByLocation(coords.lat, coords.lon);
          setWeather(data);
          setLocation(data.location);
        } catch (err) {
          // Fall back to default city
          fetchWeather();
        } finally {
          setIsLoading(false);
        }
      } else {
        // No geolocation, use default city
        fetchWeather();
      }
    };

    initializeWeather();
  }, []);

  /**
   * Generate advice messages when weather or mode changes
   */
  useEffect(() => {
    if (weather) {
      const advice = generateWeatherAdvice(weather, mode);
      setMessages(advice);
    }
  }, [weather, mode]);

  /**
   * Handle location search
   */
  const handleLocationChange = (newLocation: string) => {
    fetchWeather(newLocation);
  };

  /**
   * Handle mode change
   */
  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
  };

  /**
   * Refresh weather data
   */
  const handleRefresh = () => {
    fetchWeather();
  };

  // Get dynamic theme based on weather condition and location's time
  const weatherTheme = weather 
    ? getWeatherTheme(weather.condition, weather) 
    : { background: 'bg-background', text: '' };

  return (
    <div className={`min-h-screen weather-bg-transition ${weatherTheme.background} ${weatherTheme.text}`}>
      {/* Weather particles overlay */}
      {weather && <WeatherParticles condition={weather.condition} weather={weather} />}
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-3xl font-sans">
        {/* App Header */}
        <Header onRefresh={handleRefresh} isLoading={isLoading} />

        {/* Location Search */}
        <div className="mb-6">
          <LocationSearch
            currentLocation={location}
            onLocationChange={handleLocationChange}
            isLoading={isLoading}
          />
        </div>

        {/* Weather Display */}
        {weather && !isLoading ? (
          <div className="flex flex-col gap-4">
            {/* Live data indicator */}
            <div className="flex justify-center mb-2">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
                ${error ? 'bg-red-500/20 text-red-200' : 'bg-white/20 backdrop-blur-sm'}`}>
                <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-400' : 'bg-white animate-pulse'}`} />
                {error ? 'Sample Data' : 'Live Weather Data'}
              </span>
            </div>

            {/* Weather Card (Boxless) */}
            <WeatherCard weather={weather} />

            {/* AI Weather Analysis Banner */}
            <AiAnalysisBanner weather={weather} />

            {/* 7-Day Forecast */}
            {weather.forecast && (
              <WeeklyForecast forecast={weather.forecast} />
            )}

            {/* Extra Metrics (Samsung style) */}
            <ExtraMetrics />

            {/* Farmer Mode Button */}
            <button
              onClick={() => navigate('/farmer')}
              className="w-full flex items-center justify-center gap-3 px-6 py-[18px] 
                         bg-emerald-500/20 backdrop-blur-md text-white border-2 border-emerald-400/40
                         rounded-[2rem] font-bold text-[19px] tracking-wide
                         transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
                         hover:bg-emerald-500/30 hover:border-emerald-400/60 hover:scale-[1.02] mt-4"
            >
              <Sprout className="w-6 h-6" />
              <span>🌾 Farmer Mode</span>
            </button>

            {/* Local Guide Button - Highly Visible High Contrast */}
            <button
              onClick={() => setIsGuideOpen(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-[18px] 
                         bg-white/10 backdrop-blur-md text-white border-2 border-white/40
                         rounded-[2rem] font-bold text-[19px] tracking-wide
                         transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
                         hover:bg-white/20 hover:border-white/60 hover:scale-[1.02] mb-2"
            >
              <MapPin className="w-6 h-6" />
              <span>Talk to Local Guide</span>
            </button>

            {/* Chat Assistant */}
            <div className="w-full pt-2">
               <div className="flex justify-center mb-4">
                 <ModeToggle currentMode={mode} onModeChange={handleModeChange} />
               </div>
               <ChatAssistant messages={messages} mode={mode} />
            </div>

            {/* Sun Timeline and UV Metrics */}
            <div className="mt-16">
              <SunUvMetrics 
                uvIndex="High"
                humidity={weather.humidity}
                sunrise={weather.sunrise}
                sunset={weather.sunset}
                timezoneOffset={weather.timezoneOffset}
              />
              <SunTimeline 
                sunrise={weather.sunrise} 
                sunset={weather.sunset} 
                timezoneOffset={weather.timezoneOffset} 
              />
            </div>
          </div>
        ) : (
          /* Loading State */
          <div className="glass-card rounded-[2.5rem] p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 
                            flex items-center justify-center animate-pulse">
              <span className="text-3xl">🌤️</span>
            </div>
            <p className="text-white opacity-80 font-medium">
              Fetching weather for {location}...
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm opacity-80">
          <p className="font-medium"><span className="tracking-[0.15em]">SkySecure</span> - Your Smart Travel Companion</p>
          <p className="mt-1 text-xs opacity-70">
            Made with ❤️ for travelers and locals
          </p>
        </footer>
      </div>

      {/* Local Guide Chat Modal */}
      {weather && (
        <LocalGuideChat
          weather={weather}
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />
      )}

      {/* AI Floating Chat Widget */}
      {weather && (
        <FloatingAiChat 
          weather={weather}
        />
      )}
    </div>
  );
};

export default Index;
