import { useLanguage } from '@/contexts/LanguageContext';

/**
 * LanguageToggle Component
 * Pill-style toggle to switch between English and Hindi
 */
export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1 p-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full">
      <button
        onClick={() => setLang('en')}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300
          ${lang === 'en'
            ? 'bg-white text-black shadow-md'
            : 'text-white/50 hover:text-white/80'
          }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('hi')}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300
          ${lang === 'hi'
            ? 'bg-white text-black shadow-md'
            : 'text-white/50 hover:text-white/80'
          }`}
      >
        हिं
      </button>
    </div>
  );
}
