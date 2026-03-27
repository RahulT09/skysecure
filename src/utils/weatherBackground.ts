import { WeatherCondition, WeatherData } from '@/types/weather';

interface WeatherTheme {
  background: string;
  text: string;
}

/**
 * Check if it's currently night time at the location
 * Uses sunrise/sunset times from the API if available,
 * otherwise falls back to local time
 */
export const isNightTimeAtLocation = (weather?: WeatherData | null): boolean => {
  if (!weather) {
    // Fallback to user's local time if no weather data
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  }

  // Get current UTC time in seconds
  const nowUtc = Math.floor(Date.now() / 1000);
  
  // If we have sunrise/sunset, use them for accurate day/night
  if (weather.sunrise && weather.sunset) {
    return nowUtc < weather.sunrise || nowUtc > weather.sunset;
  }
  
  // Fallback: Calculate local time at location using timezone offset
  const timezoneOffset = weather.timezoneOffset || 0;
  const localTimeMs = Date.now() + (timezoneOffset * 1000);
  const localDate = new Date(localTimeMs);
  const localHour = localDate.getUTCHours();
  
  // Night is between 7 PM (19:00) and 6 AM
  return localHour >= 19 || localHour < 6;
};

/**
 * @deprecated Use isNightTimeAtLocation instead
 */
export const isNightTime = (): boolean => {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6;
};

/**
 * Maps weather conditions to CSS background and text classes
 * Automatically adjusts for day/night time
 */
export const getWeatherTheme = (
  condition: WeatherCondition,
  weather?: WeatherData | null
): WeatherTheme => {
  const isNight = isNightTimeAtLocation(weather);

  // 🌙 Night themes
  if (isNight) {
    const nightThemeMap: Record<WeatherCondition, WeatherTheme> = {
      sunny: { background: 'weather-bg-night-clear', text: 'weather-text-light' },
      cloudy: { background: 'weather-bg-night-cloudy', text: 'weather-text-light' },
      rainy: { background: 'weather-bg-night-rainy', text: 'weather-text-light' },
      stormy: { background: 'weather-bg-stormy', text: 'weather-text-light' },
      snowy: { background: 'weather-bg-night-snowy', text: 'weather-text-light' },
      windy: { background: 'weather-bg-night-cloudy', text: 'weather-text-light' },
      foggy: { background: 'weather-bg-night-cloudy', text: 'weather-text-light' },
    };

    return nightThemeMap[condition] || {
      background: 'weather-bg-night-clear',
      text: 'weather-text-light',
    };
  }

  // ☀️ Day themes
  const dayThemeMap: Record<WeatherCondition, WeatherTheme> = {
    sunny: { background: 'weather-bg-sunny', text: 'weather-text-dark' },
    cloudy: { background: 'weather-bg-cloudy', text: 'weather-text-light' },
    rainy: { background: 'weather-bg-rainy', text: 'weather-text-light' },
    stormy: { background: 'weather-bg-stormy', text: 'weather-text-light' },
    snowy: { background: 'weather-bg-snowy', text: 'weather-text-dark' },
    windy: { background: 'weather-bg-cloudy', text: 'weather-text-light' },
    foggy: { background: 'weather-bg-cloudy', text: 'weather-text-light' },
  };

  return dayThemeMap[condition] || {
    background: 'weather-bg-sunny',
    text: 'weather-text-dark',
  };
};

/**
 * @deprecated Use getWeatherTheme instead
 */
export const getWeatherBackgroundClass = (condition: WeatherCondition): string => {
  return getWeatherTheme(condition).background;
};