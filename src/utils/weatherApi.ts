import { WeatherData, WeatherCondition, ForecastDay } from '@/types/weather';
import { supabase } from '@/integrations/supabase/client';

// Map Open-Meteo WMO weather codes to our weather conditions
function mapWMOCode(code: number): WeatherCondition {
  if (code === 0) return 'sunny';
  if (code === 1 || code === 2 || code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'foggy';
  if (code >= 51 && code <= 67) return 'rainy';
  if (code >= 71 && code <= 77) return 'snowy';
  if (code >= 80 && code <= 82) return 'rainy';
  if (code >= 85 && code <= 86) return 'snowy';
  if (code >= 95 && code <= 99) return 'stormy';
  return 'cloudy'; // fallback
}

// Fetch 7-day forecast and sun info from Open-Meteo
async function fetchOpenMeteoData(lat: number, lon: number): Promise<Partial<WeatherData>> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto`;
  try {
    const response = await fetch(url);
    if (!response.ok) return {};
    const data = await response.json();
    
    const daily = data.daily;
    const forecast: ForecastDay[] = [];
    
    for (let i = 0; i < daily.time.length; i++) {
        forecast.push({
            date: new Date(daily.time[i]),
            maxTemp: Math.round(daily.temperature_2m_max[i]),
            minTemp: Math.round(daily.temperature_2m_min[i]),
            condition: mapWMOCode(daily.weathercode[i]),
            rainProbability: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0
        });
    }

    // Get today's sunrise/sunset as timestamp
    const sunriseStr = daily.sunrise[0];
    const sunsetStr = daily.sunset[0];
    
    return {
        forecast,
        sunrise: sunriseStr ? new Date(sunriseStr).getTime() / 1000 : undefined,
        sunset: sunsetStr ? new Date(sunsetStr).getTime() / 1000 : undefined,
    };
  } catch (error) {
    console.error('Error fetching Open-Meteo data:', error);
    return {};
  }
}

async function geocodeCity(city: string): Promise<{lat: number, lon: number} | null> {
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            return { lat: data.results[0].latitude, lon: data.results[0].longitude };
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Fetch weather data from our secure backend function
 * The API key is stored securely on the server
 */
export async function fetchWeatherData(city: string): Promise<WeatherData> {
  const { data, error } = await supabase.functions.invoke('get-weather', {
    body: { city },
  });

  if (error) {
    console.error('Error fetching weather:', error);
    throw new Error(error.message || 'Failed to fetch weather data');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  // Merge Open-Meteo data
  const coords = await geocodeCity(city);
  if (coords) {
      const extraData = await fetchOpenMeteoData(coords.lat, coords.lon);
      return { ...data, ...extraData } as WeatherData;
  }

  return data as WeatherData;
}

/**
 * Fetch weather using geolocation coordinates
 */
export async function fetchWeatherByLocation(lat: number, lon: number): Promise<WeatherData> {
  const { data, error } = await supabase.functions.invoke('get-weather', {
    body: { lat, lon },
  });

  if (error) {
    console.error('Error fetching weather:', error);
    throw new Error(error.message || 'Failed to fetch weather data');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  // Merge Open-Meteo data
  const extraData = await fetchOpenMeteoData(lat, lon);
  return { ...data, ...extraData } as WeatherData;
}

/**
 * Get user's current location using browser geolocation API
 * Returns coordinates if successful, null otherwise
 */
export function getUserLocation(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.log('Geolocation error:', error.message);
        resolve(null);
      },
      { timeout: 5000, maximumAge: 300000 }
    );
  });
}
