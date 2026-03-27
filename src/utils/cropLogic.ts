/**
 * Crop Suggestion Logic
 * Uses temperature, humidity, and rainfall probability to suggest suitable crops.
 * No paid APIs — pure rule-based logic.
 */

export interface CropSuggestion {
  crop: string;
  emoji: string;
  nameKey: string;
  reasonKey: string;
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
      { crop: 'Cotton',   emoji: '🌿', nameKey: 'crop.cotton', reasonKey: 'reason.hot_dry' },
      { crop: 'Millet',   emoji: '🌾', nameKey: 'crop.millet', reasonKey: 'reason.drought' },
      { crop: 'Sorghum',  emoji: '🌱', nameKey: 'crop.sorghum', reasonKey: 'reason.low_water' },
    );
  }

  // ─── High humidity → Moisture-loving crops ───
  if (humidity > 70) {
    suggestions.push(
      { crop: 'Rice',      emoji: '🍚', nameKey: 'crop.rice', reasonKey: 'reason.high_moisture' },
      { crop: 'Sugarcane', emoji: '🎋', nameKey: 'crop.sugarcane', reasonKey: 'reason.humid' },
      { crop: 'Jute',      emoji: '🧵', nameKey: 'crop.jute', reasonKey: 'reason.tropical' },
    );
  }

  // ─── High rainfall → Water-intensive crops ───
  if (rainfall > 60) {
    suggestions.push(
      { crop: 'Rice',  emoji: '🍚', nameKey: 'crop.rice', reasonKey: 'reason.heavy_rain' },
      { crop: 'Tea',   emoji: '🍵', nameKey: 'crop.tea', reasonKey: 'reason.humid' },
    );
  }

  // ─── Cold weather → Winter crops ───
  if (temp < 15) {
    suggestions.push(
      { crop: 'Potato',  emoji: '🥔', nameKey: 'crop.potato', reasonKey: 'reason.cool_temp' },
      { crop: 'Peas',    emoji: '🟢', nameKey: 'crop.peas', reasonKey: 'reason.cool_temp' },
      { crop: 'Mustard', emoji: '🌼', nameKey: 'crop.mustard', reasonKey: 'reason.cool_temp' },
    );
  }

  // ─── Moderate conditions → Versatile crops ───
  if (temp >= 20 && temp <= 30 && humidity >= 40 && humidity <= 70) {
    suggestions.push(
      { crop: 'Wheat',    emoji: '🌾', nameKey: 'crop.wheat', reasonKey: 'reason.moderate' },
      { crop: 'Maize',    emoji: '🌽', nameKey: 'crop.maize', reasonKey: 'reason.versatile' },
      { crop: 'Chickpea', emoji: '🫘', nameKey: 'crop.chickpea', reasonKey: 'reason.moderate' },
    );
  }

  // ─── Warm and moderately humid → Tropical crops ───
  if (temp >= 25 && temp <= 35 && humidity >= 50) {
    suggestions.push(
      { crop: 'Banana',   emoji: '🍌', nameKey: 'crop.banana', reasonKey: 'reason.tropical' },
      { crop: 'Turmeric', emoji: '🟡', nameKey: 'crop.turmeric', reasonKey: 'reason.tropical' },
    );
  }

  // ─── Fallback: always suggest at least something ───
  if (suggestions.length === 0) {
    suggestions.push(
      { crop: 'Wheat',     emoji: '🌾', nameKey: 'crop.wheat', reasonKey: 'reason.fallback' },
      { crop: 'Vegetables', emoji: '🥬', nameKey: 'crop.vegetables', reasonKey: 'reason.versatile' },
      { crop: 'Pulses',    emoji: '🫘', nameKey: 'crop.pulses', reasonKey: 'reason.versatile' },
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
