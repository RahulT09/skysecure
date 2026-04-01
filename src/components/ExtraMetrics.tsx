import { useState, useEffect } from 'react';
import { Activity, Car, HeartPulse, Wind, Loader2 } from 'lucide-react';
import { AirQualityData, fetchAirQuality } from '@/utils/airQualityApi';

interface ExtraMetricsProps {
  lat?: number;
  lon?: number;
}

export function ExtraMetrics({ lat, lon }: ExtraMetricsProps) {
  const [aqData, setAqData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (lat === undefined || lon === undefined) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchAirQuality(lat, lon).then((data) => {
      if (!cancelled) {
        setAqData(data);
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [lat, lon]);

  return (
    <div className="glass-card rounded-[2.5rem] p-6 animate-slide-up w-full shadow-xl mt-4">
      <div className="flex flex-col gap-5">
        {/* Pollen */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-white opacity-90">
              <Wind className="w-6 h-6" />
            </div>
            <span className="text-[17px] font-medium tracking-wide">
              Pollen
            </span>
          </div>
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
          ) : (
            <span className={`text-[17px] font-medium ${aqData?.pollenColor || 'opacity-80'}`}>
              {aqData?.pollenLevel || 'N/A'}
            </span>
          )}
        </div>

        {/* AQI */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-white opacity-90">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-[17px] font-medium tracking-wide">AQI</span>
          </div>
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <span className={`text-[17px] font-bold ${aqData?.aqiColor || 'opacity-80'}`}>
                {aqData?.aqi || 'N/A'}
              </span>
              <span className={`text-xs font-medium ${aqData?.aqiColor || 'opacity-60'}`}>
                {aqData?.aqiLabel || ''}
              </span>
            </div>
          )}
        </div>

        {/* Running */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-white opacity-90">
              <HeartPulse className="w-6 h-6" />
            </div>
            <span className="text-[17px] font-medium tracking-wide">
              Running
            </span>
          </div>
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <span className={`text-[17px] font-medium ${aqData?.runningColor || 'opacity-80'}`}>
                {aqData?.runningCondition || 'N/A'}
              </span>
              {aqData?.runningScore !== undefined && aqData.runningScore > 0 && (
                <span className={`text-xs font-medium ${aqData?.runningColor || 'opacity-60'}`}>
                  {aqData.runningScore}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Driving difficulty */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-white opacity-90">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-[17px] font-medium tracking-wide">
              Driving difficulty
            </span>
          </div>
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
          ) : (
            <span className={`text-[17px] font-medium ${aqData?.drivingColor || 'opacity-80'}`}>
              {aqData?.drivingDifficulty || 'N/A'}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/20 text-[13px] opacity-70">
        <span className="font-medium flex items-center gap-1.5">
          <span className="w-4 h-4 bg-white text-[#1a1a1a] text-[9px] font-bold flex items-center justify-center rounded-sm">
            AQ
          </span>
          Open-Meteo Air Quality
        </span>
        <span>
          Updated {new Date().toLocaleDateString()}{" "}
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
