import axios from 'axios';
import { WeatherData, WeatherCondition } from '@/types/weather';

/**
 * Map Open-Meteo WMO weather codes to our app's weather conditions
 */
function mapWMOCode(code: number): WeatherCondition {
  if (code === 0) return 'sunny';
  if (code >= 1 && code <= 3) return 'cloudy';
  if (code === 45 || code === 48) return 'foggy';
  if (code >= 51 && code <= 67) return 'rainy';
  if (code >= 71 && code <= 77) return 'snowy';
  if (code >= 80 && code <= 82) return 'rainy';
  if (code >= 85 && code <= 86) return 'snowy';
  if (code >= 95 && code <= 99) return 'stormy';
  return 'cloudy';
}

/**
 * Get a human-readable description for the weather code
 */
function getWeatherDescription(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 56 && code <= 57) return 'Freezing drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 66 && code <= 67) return 'Freezing rain';
  if (code >= 71 && code <= 75) return 'Snowfall';
  if (code === 77) return 'Snow grains';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code === 95) return 'Thunderstorm';
  if (code >= 96 && code <= 99) return 'Thunderstorm with hail';
  return 'Unknown';
}

/**
 * Fetch current weather + forecast directly from Open-Meteo (FREE, no API key).
 * This bypasses the Supabase edge function entirely.
 */
export async function fetchFarmerWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = 'https://api.open-meteo.com/v1/forecast';

  const response = await axios.get(url, {
    params: {
      latitude: lat,
      longitude: lon,
      current_weather: true,
      hourly: 'relativehumidity_2m,precipitation_probability',
      daily: 'weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max',
      timezone: 'auto',
    },
    timeout: 10000,
  });

  const data = response.data;
  const current = data.current_weather;

  // Get current hour's humidity and rain probability from hourly data
  const now = new Date();
  const currentHourIndex = now.getHours();
  const humidity = data.hourly?.relativehumidity_2m?.[currentHourIndex] ?? 50;
  const rainProb = data.hourly?.precipitation_probability?.[currentHourIndex] ?? 0;

  // Build forecast array
  const daily = data.daily;
  const forecast = daily.time.map((time: string, i: number) => ({
    date: new Date(time),
    maxTemp: Math.round(daily.temperature_2m_max[i]),
    minTemp: Math.round(daily.temperature_2m_min[i]),
    condition: mapWMOCode(daily.weathercode[i]),
    rainProbability: daily.precipitation_probability_max?.[i] ?? 0,
  }));

  return {
    location: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
    temperature: Math.round(current.temperature),
    condition: mapWMOCode(current.weathercode),
    humidity,
    windSpeed: Math.round(current.windspeed),
    rainProbability: rainProb,
    feelsLike: Math.round(current.temperature), // Open-Meteo current_weather doesn't have feels-like
    description: getWeatherDescription(current.weathercode),
    sunrise: daily.sunrise?.[0] ? new Date(daily.sunrise[0]).getTime() / 1000 : undefined,
    sunset: daily.sunset?.[0] ? new Date(daily.sunset[0]).getTime() / 1000 : undefined,
    forecast,
  };
}

/**
 * Reverse geocode coordinates to get a location name using Open-Meteo geocoding
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/reverse',
      {
        params: {
          lat,
          lon,
          format: 'json',
          zoom: 10,
        },
        timeout: 5000,
        headers: {
          'User-Agent': 'SkySecure-FarmerMode/1.0',
        },
      }
    );
    const addr = response.data?.address;
    if (addr) {
      // Build a nice name: city/town/village, state
      const place = addr.city || addr.town || addr.village || addr.county || '';
      const state = addr.state || '';
      return [place, state].filter(Boolean).join(', ') || response.data.display_name?.split(',').slice(0, 2).join(',') || 'Your Location';
    }
    return 'Your Location';
  } catch {
    return 'Your Location';
  }
}
