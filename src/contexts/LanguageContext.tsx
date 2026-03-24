import { createContext, useContext, useState, ReactNode } from 'react';

// ─── Supported languages ───
type Language = 'en' | 'hi';

// ─── Translation dictionary ───
const translations: Record<string, Record<Language, string>> = {
  'dashboard.title':        { en: 'Farmer Dashboard',      hi: 'किसान डैशबोर्ड' },
  'dashboard.subtitle':     { en: 'Smart Agriculture Assistant', hi: 'स्मार्ट कृषि सहायक' },
  'crop.title':             { en: 'Crop Suggestions',      hi: 'फसल सुझाव' },
  'crop.based_on':          { en: 'Based on current weather conditions', hi: 'मौजूदा मौसम की स्थिति के आधार पर' },
  'soil.title':             { en: 'Soil Information',       hi: 'मिट्टी की जानकारी' },
  'soil.ph':                { en: 'pH Level',               hi: 'पीएच स्तर' },
  'soil.clay':              { en: 'Clay',                   hi: 'मिट्टी (क्ले)' },
  'soil.sand':              { en: 'Sand',                   hi: 'रेत' },
  'soil.silt':              { en: 'Silt',                   hi: 'गाद' },
  'soil.organic_carbon':    { en: 'Organic Carbon',         hi: 'जैविक कार्बन' },
  'soil.unavailable':       { en: 'Soil data is currently unavailable for this location.', hi: 'इस स्थान के लिए मिट्टी का डेटा अभी उपलब्ध नहीं है।' },
  'market.title':           { en: 'Market Prices (Mandi)',  hi: 'बाजार भाव (मंडी)' },
  'market.mock_label':      { en: 'Showing estimated prices', hi: 'अनुमानित मूल्य दिखाए जा रहे हैं' },
  'market.per_quintal':     { en: '/quintal',               hi: '/क्विंटल' },
  'map.title':              { en: 'Nearby Mandis & Location', hi: 'नजदीकी मंडियाँ और स्थान' },
  'map.your_location':      { en: 'Your Location',          hi: 'आपका स्थान' },
  'weather.temperature':    { en: 'Temperature',            hi: 'तापमान' },
  'weather.humidity':       { en: 'Humidity',               hi: 'आर्द्रता' },
  'weather.rain':           { en: 'Rain Chance',            hi: 'बारिश की संभावना' },
  'weather.wind':           { en: 'Wind Speed',             hi: 'हवा की गति' },
  'weather.condition':      { en: 'Condition',              hi: 'स्थिति' },
  'nav.back':               { en: '← Back to Weather',     hi: '← मौसम पर वापस' },
  'loading':                { en: 'Loading...',             hi: 'लोड हो रहा है...' },
  'language.label':         { en: 'EN',                     hi: 'हिं' },
};

// ─── Context shape ───
interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  /** Translate a key. Returns the key itself if not found. */
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ─── Provider component ───
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  // Translation helper
  const t = (key: string): string => {
    return translations[key]?.[lang] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── Hook for consuming the context ───
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
