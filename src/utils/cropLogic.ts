/**
 * Crop Suggestion Logic
 * Uses temperature, humidity, and rainfall probability to suggest suitable crops.
 * No paid APIs — pure rule-based logic.
 */

export interface CropSuggestion {
  crop: string;
  emoji: string;
  reason: string;
  reasonHi: string;
}

/**
 * Suggest crops based on current weather conditions
 * @param temp - Temperature in °C
 * @param humidity - Humidity percentage (0–100)
 * @param rainfall - Rainfall probability percentage (0–100)
 */
export function suggestCrops(
  temp: number,
  humidity: number,
  rainfall: number
): CropSuggestion[] {
  const suggestions: CropSuggestion[] = [];

  // ─── High temperature + low humidity → Dry / arid crops ───
  if (temp > 35 && humidity < 40) {
    suggestions.push(
      { crop: 'Cotton',   emoji: '🌿', reason: 'Thrives in hot, dry conditions',       reasonHi: 'गर्म और शुष्क मौसम में अच्छी होती है' },
      { crop: 'Millet',   emoji: '🌾', reason: 'Drought-resistant, ideal for high heat', reasonHi: 'सूखा-प्रतिरोधी, अधिक गर्मी के लिए आदर्श' },
      { crop: 'Sorghum',  emoji: '🌱', reason: 'Low water requirement crop',            reasonHi: 'कम पानी वाली फसल' },
    );
  }

  // ─── High humidity → Moisture-loving crops ───
  if (humidity > 70) {
    suggestions.push(
      { crop: 'Rice',      emoji: '🍚', reason: 'Needs high moisture and humidity',     reasonHi: 'अधिक नमी और आर्द्रता की आवश्यकता' },
      { crop: 'Sugarcane', emoji: '🎋', reason: 'Flourishes in humid conditions',        reasonHi: 'नम स्थितियों में बढ़ती है' },
      { crop: 'Jute',      emoji: '🧵', reason: 'Ideal for warm, humid climates',        reasonHi: 'गर्म, नम जलवायु के लिए आदर्श' },
    );
  }

  // ─── High rainfall → Water-intensive crops ───
  if (rainfall > 60) {
    suggestions.push(
      { crop: 'Rice',  emoji: '🍚', reason: 'Benefits from heavy rainfall',              reasonHi: 'भारी बारिश से लाभ होता है' },
      { crop: 'Tea',   emoji: '🍵', reason: 'Needs consistent rain and moisture',         reasonHi: 'लगातार बारिश और नमी जरूरी' },
    );
  }

  // ─── Cold weather → Winter crops ───
  if (temp < 15) {
    suggestions.push(
      { crop: 'Potato',  emoji: '🥔', reason: 'Grows well in cool temperatures',         reasonHi: 'ठंडे तापमान में अच्छी तरह बढ़ता है' },
      { crop: 'Peas',    emoji: '🟢', reason: 'Cool season crop, frost tolerant',         reasonHi: 'ठंडी ऋतु की फसल, पाला सहन करती है' },
      { crop: 'Mustard', emoji: '🌼', reason: 'Ideal winter oilseed crop',                reasonHi: 'आदर्श शीतकालीन तिलहन फसल' },
    );
  }

  // ─── Moderate conditions → Versatile crops ───
  if (temp >= 20 && temp <= 30 && humidity >= 40 && humidity <= 70) {
    suggestions.push(
      { crop: 'Wheat',    emoji: '🌾', reason: 'Thrives in moderate climate',             reasonHi: 'मध्यम जलवायु में बढ़ता है' },
      { crop: 'Maize',    emoji: '🌽', reason: 'Versatile crop for balanced weather',     reasonHi: 'संतुलित मौसम के लिए बहुमुखी फसल' },
      { crop: 'Chickpea', emoji: '🫘', reason: 'Good for moderate temp & moisture',       reasonHi: 'मध्यम तापमान और नमी के लिए अच्छा' },
    );
  }

  // ─── Warm and moderately humid → Tropical crops ───
  if (temp >= 25 && temp <= 35 && humidity >= 50) {
    suggestions.push(
      { crop: 'Banana',   emoji: '🍌', reason: 'Loves warm and humid conditions',         reasonHi: 'गर्म और नम स्थितियों को पसंद करता है' },
      { crop: 'Turmeric', emoji: '🟡', reason: 'Thrives in tropical warmth',              reasonHi: 'उष्णकटिबंधीय गर्मी में बढ़ता है' },
    );
  }

  // ─── Fallback: always suggest at least something ───
  if (suggestions.length === 0) {
    suggestions.push(
      { crop: 'Wheat',     emoji: '🌾', reason: 'A versatile crop for most conditions',   reasonHi: 'अधिकांश स्थितियों के लिए बहुमुखी फसल' },
      { crop: 'Vegetables', emoji: '🥬', reason: 'Kitchen garden crops suit all climates', reasonHi: 'किचन गार्डन फसलें सभी जलवायु में उपयुक्त' },
      { crop: 'Pulses',    emoji: '🫘', reason: 'Nitrogen-fixing, suits varied weather',   reasonHi: 'नाइट्रोजन-फिक्सिंग, विभिन्न मौसम के अनुकूल' },
    );
  }

  // Remove duplicates by crop name
  const seen = new Set<string>();
  return suggestions.filter((s) => {
    if (seen.has(s.crop)) return false;
    seen.add(s.crop);
    return true;
  });
}
