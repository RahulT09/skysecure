import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchMarketPrices, MarketPrice } from '@/utils/marketData';

/**
 * MarketPrices Component
 * Shows crop market prices from Agmarknet or mock fallback data
 */
export function MarketPrices() {
  const { lang, t } = useLanguage();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [isMock, setIsMock] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadPrices = async () => {
      setLoading(true);
      const result = await fetchMarketPrices();

      if (cancelled) return;

      setPrices(result.prices);
      setIsMock(result.isMock);
      setLoading(false);
    };

    loadPrices();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 animate-slide-up">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          💰 {t('market.title')}
        </h2>
        {isMock && !loading && (
          <span className="text-xs text-amber-300/80 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            {t('market.mock_label')}
          </span>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Price cards */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {prices.map((item, index) => (
            <div
              key={item.crop + index}
              className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-white/5 border border-white/10
                         hover:bg-white/10 transition-all duration-300"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-sm font-semibold text-white text-center">
                {lang === 'hi' ? item.cropHi : item.crop}
              </span>
              <span className="text-lg font-bold text-emerald-300">
                ₹{item.price.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-white/40">{t('market.per_quintal')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
