import { useEffect, useState } from 'react';
import { Sunrise, Sunset } from 'lucide-react';

interface SunTimelineProps {
  sunrise?: number; // unix timestamp
  sunset?: number;  // unix timestamp
  timezoneOffset?: number; // in seconds
}

export function SunTimeline({ sunrise, sunset, timezoneOffset = 0 }: SunTimelineProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!sunrise || !sunset) return;

    const updateProgress = () => {
      // current timestamp in UTC + offset
      const now = Math.floor(Date.now() / 1000);
      
      if (now < sunrise) {
        setProgress(0);
      } else if (now > sunset) {
        setProgress(100);
      } else {
        const totalDaylight = sunset - sunrise;
        const elapsed = now - sunrise;
        setProgress((elapsed / totalDaylight) * 100);
      }
    };

    updateProgress();
    const interval = setInterval(updateProgress, 60000); // update every minute
    return () => clearInterval(interval);
  }, [sunrise, sunset]);

  if (!sunrise || !sunset) return null;

  const sunriseTime = new Date((sunrise + timezoneOffset) * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC' // We added the offset manually to the timestamp
  });

  const sunsetTime = new Date((sunset + timezoneOffset) * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC'
  });

  return (
    <div className="glass-card rounded-[2.5rem] p-6 animate-slide-up w-full mt-4">
      <h3 className="text-xl font-semibold mb-6 px-2 opacity-90">Sunrise & Sunset</h3>
      
      <div className="relative pt-8 pb-4">
        {/* Sun Arc Path */}
        <div className="w-full h-24 border-t-2 border-dashed border-white/30 rounded-t-[100%] rounded-b-none relative overflow-visible">
          
          {/* Moving Sun Icon */}
          <div 
            className="absolute -top-3 -ml-3 w-6 h-6 rounded-full bg-amber-300 shadow-[0_0_15px_rgba(252,211,77,0.8)] transition-all duration-1000"
            style={{ 
              left: `${progress}%`,
              transform: `translateY(${Math.abs((progress - 50) / 50) * 1.5}rem)` // slight vertical dip simulating arc perfectly
            }}
          />
        </div>

        {/* Labels */}
        <div className="flex justify-between items-center -mt-2">
          <div className="flex flex-col items-start gap-1">
            <Sunrise className="w-6 h-6 text-amber-300" />
            <span className="font-semibold">{sunriseTime}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Sunset className="w-6 h-6 text-amber-300 opacity-80" />
            <span className="font-semibold">{sunsetTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
