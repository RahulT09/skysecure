import { Sunrise, Sunset,Droplet } from "lucide-react";

type SunUvMetricsProps = {
  uvIndex?: string;
  humidity?: number;
  sunrise?: number;
  sunset?: number;
  timezoneOffset?: number; // from OpenWeather (seconds)
};

export function SunUvMetrics({
  uvIndex = 'High',
  humidity = 55,
  sunrise,
  sunset,
  timezoneOffset = 0,
}: SunUvMetricsProps) {

  // ✅ Correct time formatter (FIXED)
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '--:--';

    return new Date((timestamp + timezoneOffset) * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC', // 🔥 IMPORTANT FIX
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4 w-full animate-slide-up mt-4">
      
      {/* UV Index */}
      <div className="glass-card rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center">
        <Sunset className="w-8 h-8 text-amber-400 mb-3" />
        <span className="text-white font-semibold mb-1">UV Index</span>
        <span className="text-white/60 font-medium">{uvIndex}</span>
      </div>

      {/* Humidity */}
      <div className="glass-card rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center">
        <Droplet className="w-8 h-8 text-blue-400 mb-3" />
        <span className="text-white font-semibold mb-1">Humidity</span>
        <span className="text-white/60 font-medium">{humidity}%</span>
      </div>

      {/* Sunrise */}
      <div className="glass-card rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center">
        <Sunrise className="w-8 h-8 text-orange-400 mb-3" />
        <span className="text-white font-semibold mb-1">Sunrise</span>
        <span className="text-white/60 font-medium">
          {formatTime(sunrise)}
        </span>
      </div>

      {/* Sunset */}
      <div className="glass-card rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center">
        <Sunset className="w-8 h-8 text-orange-500 mb-3" />
        <span className="text-white font-semibold mb-1">Sunset</span>
        <span className="text-white/60 font-medium">
          {formatTime(sunset)}
        </span>
      </div>
    </div>
  );
}