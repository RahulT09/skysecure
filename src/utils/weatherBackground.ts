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
  // ✅ Fallback if no weather data
  if (!weather || !weather.sys) {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  }

  // ✅ Current UTC time in seconds
  const nowUTC = Math.floor(Date.now() / 1000);

  // ✅ Convert to location's local time using timezone offset
  const localTime = nowUTC + (weather.timezone || 0);

  const sunrise = weather.sys.sunrise;
  const sunset = weather.sys.sunset;

  // ✅ Night if before sunrise OR after sunset
  return localTime < sunrise || localTime > sunset;
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
