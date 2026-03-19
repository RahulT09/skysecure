import { ForecastDay } from '@/types/weather';
import { WeatherIcon } from './WeatherIcon';
import { Droplets } from 'lucide-react';

interface WeeklyForecastProps {
  forecast: ForecastDay[];
}

export function WeeklyForecast({ forecast }: WeeklyForecastProps) {
  if (!forecast || forecast.length === 0) return null;

  // Find overall min and max temperatures to scale the bars
  const overallMin = Math.min(...forecast.map(f => f.minTemp));
  const overallMax = Math.max(...forecast.map(f => f.maxTemp));
  const range = overallMax - overallMin;

  return (
    <div className="glass-card rounded-[2.5rem] p-6 pb-2 animate-slide-up w-full text-white">
      <div className="flex flex-col">
        {forecast.map((day, index) => {
          const isToday = index === 0;
          
          // Formating the date similar to mockup if needed, but mockup doesn't show dates in the snippet.
          // Wait, mockup image 2 doesn't show the day of week? It's just rows. I will add day of week on the very left so it is readable.
          // Let's look closely... oh, the mockup snippet is actually the right side of the screen? Or maybe no dates?
          // I'll put the day of week on the far left, then rain chance, day icon, night icon, high/low.
          const dateStr = isToday ? 'Today' : day.date.toLocaleDateString('en-US', { weekday: 'short' });

          return (
            <div key={index} className="flex items-center justify-between py-4 border-b border-white/10 last:border-0 last:pb-4">
              
              {/* Day Name */}
              <div className="w-16 font-medium text-[15px] opacity-90">
                {dateStr}
              </div>

              {/* Rain Chance */}
              <div className="flex items-center gap-1.5 w-16 justify-start opacity-70">
                <Droplets className="w-[14px] h-[14px]" />
                <span className="text-[14px]">{day.rainProbability || 0}%</span>
              </div>
              
              {/* Day & Night Icons */}
              <div className="flex items-center gap-3">
                <WeatherIcon condition={day.condition} size="sm" />
                <WeatherIcon condition={day.condition === 'sunny' ? 'cloudy' : day.condition} size="sm" />
              </div>

              {/* Temps */}
              <div className="flex items-center gap-2 w-20 justify-end">
                <span className="font-bold text-[16px]">{day.maxTemp}°</span>
                <span className="opacity-60 text-[15px]">{day.minTemp}°</span>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
