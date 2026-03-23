import { WeatherData } from "@/types/weather";
import { WeatherIcon } from "./WeatherIcon";
import { Droplets, Wind, Thermometer, CloudRain } from "lucide-react";

interface WeatherCardProps {
  weather: WeatherData;
}

/**
 * Main weather display card showing current conditions
 */
export function WeatherCard({ weather }: WeatherCardProps) {
  return (
    <div className="w-full flex justify-between items-center animate-slide-up mt-8 mb-4 px-2">
      {/* Left Column: Location & Temp */}
      <div className="flex flex-col items-start">
        {/* Location Header with Line */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-0.5 bg-amber-400 rounded-full" />
          <h2 className="text-sm font-bold tracking-[0.2em] text-white uppercase">
            {weather.location}
          </h2>
        </div>

        {/* Temperature & Feels Like */}
        <div className="flex flex-col items-start mt-2">
  
  {/* Temperature Row */}
  <div className="flex items-start mb-2">
    <span className="text-[70px] md:text-[120px] leading-[0.85] font-light tracking-tighter text-white">
      {weather.temperature}
    </span>
    <span className="text-2xl md:text-4xl font-light text-white/70 mt-2 md:mt-4">
      °C
    </span>
  </div>

  {/* Feels Like BELOW */}
  <div className="mt-1 md:mt-2 px-2 py-0.5 md:px-2 md:py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] md:text-xs font-medium text-white/90 shadow-sm whitespace-nowrap">
    Feels like {weather.feelsLike}°C
  </div>

</div>
      </div>

      {/* Right Column: Condition Icon */}
      <div className="flex flex-col items-center justify-center mr-4">
        <WeatherIcon condition={weather.condition} size="xl" />
        <span className="mt-3 text-[15px] font-semibold text-white/90 capitalize tracking-wide drop-shadow-md">
          {weather.description}
        </span>
      </div>
    </div>
  );
}
