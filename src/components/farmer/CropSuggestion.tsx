import { useLanguage } from '@/contexts/LanguageContext';
import { suggestCrops, CropSuggestion } from '@/utils/cropLogic';

interface CropSuggestionProps {
  temperature: number;
  humidity: number;
  rainfall: number;
}

/**
 * CropSuggestion Component
 * Displays crop recommendations based on current weather conditions
 */
export function CropSuggestionCard({ temperature, humidity, rainfall }: CropSuggestionProps) {
  const { lang, t } = useLanguage();
  const crops = suggestCrops(temperature, humidity, rainfall);

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 animate-slide-up">
      {/* Section header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🌾 {t('crop.title')}
        </h2>
        <p className="text-sm text-white/60 mt-1">{t('crop.based_on')}</p>
      </div>

      {/* Crop cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {crops.map((crop: CropSuggestion, index: number) => (
          <div
            key={crop.nameKey}
            className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10
                       hover:bg-white/10 transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="text-3xl">{crop.emoji}</span>
            <div>
              <h3 className="font-semibold text-white text-base">{t(crop.nameKey)}</h3>
              <p className="text-sm text-white/60 mt-0.5">
                {t(crop.reasonKey)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
