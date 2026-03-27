import { createContext, useContext, useState, ReactNode } from 'react';

// ─── Supported languages ───
export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu' | 'kn' | 'pa' | 'ml';

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  bn: 'বাংলা',
  mr: 'मराठी',
  gu: 'ગુજરાતી',
  kn: 'ಕನ್ನಡ',
  pa: 'ਪੰਜਾਬੀ',
  ml: 'മലയാളം',
};

// ─── Translation dictionary ───
const translations: Record<string, Record<Language, string>> = {
  'dashboard.title': {
    en: 'Farmer Dashboard',
    hi: 'किसान डैशबोर्ड',
    ta: 'விவசாயி டாஷ்போர்டு',
    te: 'రైతు డాష్‌బోర్డ్',
    bn: 'কৃষক ড্যাশবোর্ড',
    mr: 'शेतकरी डॅशबोर्ड',
    gu: 'ખેડૂત ડેશબોર્ડ',
    kn: 'ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    pa: 'ਕਿਸਾਨ ਡੈਸ਼ਬੋਰਡ',
    ml: 'കർഷക ഡാഷ്‌ബോർഡ്',
  },
  'dashboard.subtitle': {
    en: 'Smart Agriculture Assistant',
    hi: 'स्मार्ट कृषि सहायक',
    ta: 'ஸ்மார்ட் வேளாண் உதவியாளர்',
    te: 'స్మార్ట్ వ్యవసాయ సహాయకుడు',
    bn: 'স্মার্ট কৃষি সহায়ক',
    mr: 'स्मार्ट कृषी सहाय्यक',
    gu: 'સ્માર્ટ કૃષિ સહાયક',
    kn: 'ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ',
    pa: 'ਸਮਾਰਟ ਖੇਤੀ ਸਹਾਇਕ',
    ml: 'സ്മാർട്ട് കാർഷിക സഹായി',
  },
  'crop.title': {
    en: 'Crop Suggestions',
    hi: 'फसल सुझाव',
    ta: 'பயிர் ஆலோசனைகள்',
    te: 'పంట సూచనలు',
    bn: 'ফসল পরামর্শ',
    mr: 'पिकांचे सुझाव',
    gu: 'પાકના સૂચનો',
    kn: 'ಬೆಳೆ ಸಲಹೆಗಳು',
    pa: 'ਫ਼ਸਲ ਸੁਝਾਅ',
    ml: 'വിള നിർദ്ദേശങ്ങൾ',
  },
  'crop.based_on': {
    en: 'Based on current weather conditions',
    hi: 'मौजूदा मौसम की स्थिति के आधार पर',
    ta: 'தற்போதைய வானிலை நிலைமைகளின் அடிப்படையில்',
    te: 'ప్రస్తుత వాతావరణ పరిస్థితుల ఆధారంగా',
    bn: 'বর্তমান আবহাওয়া পরিস্থিতির উপর ভিত্তি করে',
    mr: 'सध्याच्या हवामान परिस्थितीवर आधारित',
    gu: 'વર્તમાન હવામાન પરિસ્થિતિના આધારે',
    kn: 'ಪ್ರಸ್ತುತ ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿಗಳ ಆಧಾರದ ಮೇಲೆ',
    pa: 'ਮੌਜੂਦਾ ਮੌਸਮ ਦੀਆਂ ਸਥਿਤੀਆਂ ਦੇ ਅਧਾਰ ਤੇ',
    ml: 'നിലവിലെ കാലാവസ്ഥ സാഹചര്യങ്ങളുടെ അടിസ്ഥാനത്തിൽ',
  },
  'soil.title': {
    en: 'Soil Information',
    hi: 'मिट्टी की जानकारी',
    ta: 'மண் தகவல்',
    te: 'నేల సమాచారం',
    bn: 'মাটির তথ্য',
    mr: 'माती माहिती',
    gu: 'માટીની માહિતી',
    kn: 'ಮಣ್ಣಿನ ಮಾಹಿತಿ',
    pa: 'ਮਿੱਟੀ ਦੀ ਜਾਣਕਾਰੀ',
    ml: 'മണ്ണിന്റെ വിവരങ്ങൾ',
  },
  'soil.ph': {
    en: 'pH Level',
    hi: 'पीएच स्तर',
    ta: 'pH நிலை',
    te: 'pH స్థాయి',
    bn: 'pH মাত্রা',
    mr: 'pH पातळी',
    gu: 'pH સ્તર',
    kn: 'pH ಮಟ್ಟ',
    pa: 'pH ਪੱਧਰ',
    ml: 'pH നില',
  },
  'soil.clay': {
    en: 'Clay',
    hi: 'मिट्टी (क्ले)',
    ta: 'களிமண்',
    te: 'బంకమట్టి',
    bn: 'কাদামাটি',
    mr: 'चिकणमाती',
    gu: 'ચીકણી માટી',
    kn: 'ಜೇಡಿ ಮಣ್ಣು',
    pa: 'ਚੀਕਣੀ ਮਿੱਟੀ',
    ml: 'കളിമൺ',
  },
  'soil.sand': {
    en: 'Sand',
    hi: 'रेत',
    ta: 'மணல்',
    te: 'ఇసుక',
    bn: 'বালি',
    mr: 'वाळू',
    gu: 'રેતી',
    kn: 'ಮರಳು',
    pa: 'ਰੇਤ',
    ml: 'മണൽ',
  },
  'soil.silt': {
    en: 'Silt',
    hi: 'गाद',
    ta: 'வண்டல்',
    te: 'ఒండు మట్టి',
    bn: 'পলি',
    mr: 'गाळ',
    gu: 'કાંપ',
    kn: 'ಹೂಳು',
    pa: 'ਗਾਦ',
    ml: 'എക്കൽ',
  },
  'soil.organic_carbon': {
    en: 'Organic Carbon',
    hi: 'जैविक कार्बन',
    ta: 'கரிம கார்பன்',
    te: 'సేంద్రీయ కార్బన్',
    bn: 'জৈব কার্বন',
    mr: 'सेंद्रिय कार्बन',
    gu: 'ઓર્ગેનિક કાર્બન',
    kn: 'ಸಾವಯವ ಇಂಗಾಲ',
    pa: 'ਜੈਵਿਕ ਕਾਰਬਨ',
    ml: 'ജൈവ കാർബൺ',
  },
  'soil.unavailable': {
    en: 'Soil data is currently unavailable for this location.',
    hi: 'इस स्थान के लिए मिट्टी का डेटा अभी उपलब्ध नहीं है।',
    ta: 'இந்த இடத்திற்கான மண் தரவு தற்போது கிடைக்கவில்லை.',
    te: 'ఈ ప్రదేశానికి నేల డేటా ప్రస్తుతం అందుబాటులో లేదు.',
    bn: 'এই স্থানের মাটির তথ্য বর্তমানে উপলব্ধ নেই।',
    mr: 'या ठिकाणासाठी माती डेटा सध्या उपलब्ध नाही.',
    gu: 'આ સ્થાન માટે માટીનો ડેટા હાલમાં ઉપલબ્ધ નથી.',
    kn: 'ಈ ಸ್ಥಳಕ್ಕೆ ಮಣ್ಣಿನ ಡೇಟಾ ಪ್ರಸ್ತುತ ಲಭ್ಯವಿಲ್ಲ.',
    pa: 'ਇਸ ਥਾਂ ਲਈ ਮਿੱਟੀ ਡਾਟਾ ਮੌਜੂਦ ਨਹੀਂ ਹੈ।',
    ml: 'ഈ സ്ഥലത്തിന്റെ മണ്ണ് ഡാറ്റ നിലവിൽ ലഭ്യമല്ല.',
  },
  'market.title': {
    en: 'Market Prices (Mandi)',
    hi: 'बाजार भाव (मंडी)',
    ta: 'சந்தை விலைகள் (மண்டி)',
    te: 'మార్కెట్ ధరలు (మండి)',
    bn: 'বাজার দর (মন্ডি)',
    mr: 'बाजार भाव (मंडी)',
    gu: 'બજાર ભાવ (મંડી)',
    kn: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು (ಮಂಡಿ)',
    pa: 'ਬਜ਼ਾਰ ਭਾਅ (ਮੰਡੀ)',
    ml: 'മാർക്കറ്റ് വിലകൾ (മണ്ടി)',
  },
  'market.mock_label': {
    en: 'Showing estimated prices',
    hi: 'अनुमानित मूल्य दिखाए जा रहे हैं',
    ta: 'மதிப்பிடப்பட்ட விலைகள் காட்டப்படுகின்றன',
    te: 'అంచనా ధరలు చూపబడుతున్నాయి',
    bn: 'আনুমানিক মূল্য দেখানো হচ্ছে',
    mr: 'अंदाजित किंमती दाखवत आहे',
    gu: 'અંદાજિત ભાવ બતાવવામાં આવી રહ્યા છે',
    kn: 'ಅಂದಾಜು ಬೆಲೆಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ',
    pa: 'ਅੰਦਾਜ਼ਨ ਕੀਮਤਾਂ ਦਿਖਾਈਆਂ ਜਾ ਰਹੀਆਂ ਹਨ',
    ml: 'കണക്കാക്കിയ വിലകൾ കാണിക്കുന്നു',
  },
  'market.per_quintal': {
    en: '/quintal',
    hi: '/क्विंटल',
    ta: '/குவிண்டால்',
    te: '/క్వింటాల్',
    bn: '/কুইন্টাল',
    mr: '/क्विंटल',
    gu: '/ક્વિન્ટલ',
    kn: '/ಕ್ವಿಂಟಾಲ್',
    pa: '/ਕੁਇੰਟਲ',
    ml: '/ക്വിന്റൽ',
  },
  'map.title': {
    en: 'Nearby Mandis & Location',
    hi: 'नजदीकी मंडियाँ और स्थान',
    ta: 'அருகிலுள்ள மண்டிகள் & இடம்',
    te: 'సమీపంలోని మండీలు & ప్రదేశం',
    bn: 'কাছাকাছি মন্ডি ও অবস্থান',
    mr: 'जवळच्या मंडी आणि स्थान',
    gu: 'નજીકની મંડીઓ અને સ્થાન',
    kn: 'ಸಮೀಪದ ಮಂಡಿಗಳು & ಸ್ಥಳ',
    pa: 'ਨੇੜਲੀਆਂ ਮੰਡੀਆਂ ਅਤੇ ਥਾਂ',
    ml: 'അടുത്തുള്ള മണ്ടികളും സ്ഥാനവും',
  },
  'map.your_location': {
    en: 'Your Location',
    hi: 'आपका स्थान',
    ta: 'உங்கள் இடம்',
    te: 'మీ ప్రదేశం',
    bn: 'আপনার অবস্থান',
    mr: 'तुमचे स्थान',
    gu: 'તમારું સ્થાન',
    kn: 'ನಿಮ್ಮ ಸ್ಥಳ',
    pa: 'ਤੁਹਾਡੀ ਥਾਂ',
    ml: 'നിങ്ങളുടെ സ്ഥാനം',
  },
  'weather.temperature': {
    en: 'Temperature',
    hi: 'तापमान',
    ta: 'வெப்பநிலை',
    te: 'ఉష్ణోగ్రత',
    bn: 'তাপমাত্রা',
    mr: 'तापमान',
    gu: 'તાપમાન',
    kn: 'ತಾಪಮಾನ',
    pa: 'ਤਾਪਮਾਨ',
    ml: 'താപനില',
  },
  'weather.humidity': {
    en: 'Humidity',
    hi: 'आर्द्रता',
    ta: 'ஈரப்பதம்',
    te: 'తేమ',
    bn: 'আর্দ্রতা',
    mr: 'आर्द्रता',
    gu: 'ભેજ',
    kn: 'ತೇವಾಂಶ',
    pa: 'ਨਮੀ',
    ml: 'ആർദ്രത',
  },
  'weather.rain': {
    en: 'Rain Chance',
    hi: 'बारिश की संभावना',
    ta: 'மழை வாய்ப்பு',
    te: 'వర్షం అవకాశం',
    bn: 'বৃষ্টির সম্ভাবনা',
    mr: 'पावसाची शक्यता',
    gu: 'વરસાદની શક્યતા',
    kn: 'ಮಳೆ ಸಾಧ್ಯತೆ',
    pa: 'ਬਾਰਿਸ਼ ਦੀ ਸੰਭਾਵਨਾ',
    ml: 'മഴ സാധ്യത',
  },
  'weather.wind': {
    en: 'Wind Speed',
    hi: 'हवा की गति',
    ta: 'காற்றின் வேகம்',
    te: 'గాలి వేగం',
    bn: 'বাতাসের গতি',
    mr: 'वाऱ्याचा वेग',
    gu: 'પવનની ગતિ',
    kn: 'ಗಾಳಿ ವೇಗ',
    pa: 'ਹਵਾ ਦੀ ਗਤੀ',
    ml: 'കാറ്റിന്റെ വേഗത',
  },
  'weather.condition': {
    en: 'Condition',
    hi: 'स्थिति',
    ta: 'நிலை',
    te: 'పరిస్థితి',
    bn: 'অবস্থা',
    mr: 'स्थिती',
    gu: 'સ્થિતિ',
    kn: 'ಸ್ಥಿತಿ',
    pa: 'ਸਥਿਤੀ',
    ml: 'അവസ്ഥ',
  },
  'nav.back': {
    en: '← Back to Weather',
    hi: '← मौसम पर वापस',
    ta: '← வானிலைக்குத் திரும்பு',
    te: '← వాతావరణానికి తిరిగి',
    bn: '← আবহাওয়ায় ফিরুন',
    mr: '← हवामानावर परत',
    gu: '← હવામાન પર પાછા',
    kn: '← ಹವಾಮಾನಕ್ಕೆ ಹಿಂತಿರುಗಿ',
    pa: '← ਮੌਸਮ ਤੇ ਵਾਪਸ',
    ml: '← കാലാവസ്ഥയിലേക്ക് മടങ്ങുക',
  },
  'loading': {
    en: 'Loading...',
    hi: 'लोड हो रहा है...',
    ta: 'ஏற்றுகிறது...',
    te: 'లోడ్ అవుతోంది...',
    bn: 'লোড হচ্ছে...',
    mr: 'लोड होत आहे...',
    gu: 'લોડ થઈ રહ્યું છે...',
    kn: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    pa: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    ml: 'ലോഡ് ചെയ്യുന്നു...',
  },
  'language.label': {
    en: 'EN',
    hi: 'हिं',
    ta: 'த',
    te: 'తె',
    bn: 'বা',
    mr: 'म',
    gu: 'ગુ',
    kn: 'ಕ',
    pa: 'ਪੰ',
    ml: 'മ',
  },
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
