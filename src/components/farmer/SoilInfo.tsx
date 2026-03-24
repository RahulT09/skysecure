import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchSoilData, SoilData } from '@/utils/soilApi';

interface SoilInfoProps {
  lat: number;
  lon: number;
}

/**
 * SoilInfo Component
 * Fetches and displays soil properties from SoilGrids API
 */
export function SoilInfo({ lat, lon }: SoilInfoProps) {
  const { t } = useLanguage();
  const [soil, setSoil] = useState<SoilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadSoil = async () => {
      setLoading(true);
      setFailed(false);
      const data = await fetchSoilData(lat, lon);

      if (cancelled) return;

      if (data) {
        setSoil(data);
      } else {
        setFailed(true);
      }
      setLoading(false);
    };

    loadSoil();
    return () => { cancelled = true; };
  }, [lat, lon]);

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 animate-slide-up">
      {/* Section header */}
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
        🏔️ {t('soil.title')}
      </h2>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error / fallback state */}
      {!loading && failed && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-2xl">⚠️</span>
          <p className="text-sm text-white/70">{t('soil.unavailable')}</p>
        </div>
      )}

      {/* Data display */}
      {!loading && soil && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <SoilMetric
            label={t('soil.ph')}
            value={soil.phLevel != null ? (soil.phLevel / 10).toFixed(1) : '—'}
            emoji="🧪"
          />
          <SoilMetric
            label={t('soil.clay')}
            value={soil.clay != null ? `${(soil.clay / 10).toFixed(0)}%` : '—'}
            emoji="🟤"
          />
          <SoilMetric
            label={t('soil.sand')}
            value={soil.sand != null ? `${(soil.sand / 10).toFixed(0)}%` : '—'}
            emoji="🏖️"
          />
          <SoilMetric
            label={t('soil.silt')}
            value={soil.silt != null ? `${(soil.silt / 10).toFixed(0)}%` : '—'}
            emoji="🌊"
          />
          <SoilMetric
            label={t('soil.organic_carbon')}
            value={soil.organicCarbon != null ? `${(soil.organicCarbon / 10).toFixed(1)} g/kg` : '—'}
            emoji="🍂"
          />
        </div>
      )}
    </div>
  );
}

// ─── Small metric card ───
function SoilMetric({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/5 border border-white/10">
      <span className="text-xl">{emoji}</span>
      <span className="text-lg font-bold text-white">{value}</span>
      <span className="text-xs text-white/50 text-center">{label}</span>
    </div>
  );
}
