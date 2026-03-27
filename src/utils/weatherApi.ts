import { WeatherData, WeatherCondition, ForecastDay } from '@/types/weather';
import { supabase } from '@/integrations/supabase/client';

// ─── Map Open-Meteo WMO weather codes to our weather conditions ───
function mapWMOCode(code: number): WeatherCondition {
  if (code === 0) return 'sunny';
  if (code === 1 || code === 2 || code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'foggy';
  if (code >= 51 && code <= 67) return 'rainy';
  if (code >= 71 && code <= 77) return 'snowy';
  if (code >= 80 && code <= 82) return 'rainy';
  if (code >= 85 && code <= 86) return 'snowy';
  if (code >= 95 && code <= 99) return 'stormy';
  return 'cloudy';
}

/**
 * Get a human-readable weather description from WMO code
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

// ─── Geocode city name → coordinates + display name ───
async function geocodeCity(city: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    // 1️⃣ Try highly-accurate Nominatim proxy first (supports small Indian suburbs flawlessly)
    const proxyUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=5`;
    const proxyRes = await fetch(proxyUrl, {
      headers: {
        'Accept-Language': 'en-US'
      }
    });
    
    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (Array.isArray(data) && data.length > 0) {
        // Prioritize India matches
        let r = data.find((item: any) => item.display_name?.includes('India'));
        if (!r) r = data[0];

        // Ensure name isn't too long by grabbing the first 3 components of the display_name
        const parts = r.display_name.split(',').map((p: string) => p.trim());
        const shortName = parts.slice(0, 3).join(', ');

        return { lat: parseFloat(r.lat), lon: parseFloat(r.lon), name: shortName };
      }
    }
  } catch (err) {
    console.warn('Nominatim proxy failed, falling back to Open-Meteo', err);
  }

  // 2️⃣ Fallback: Open-Meteo geocoding (best for major global cities only)
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    
    if (data.results && data.results.length > 0) {
      let r = data.results.find((result: any) => result.country === 'India' || result.country_code === 'IN');
      if (!r) r = data.results[0];

      const name = [r.name, r.admin1, r.country].filter(Boolean).join(', ');
      return { lat: r.latitude, lon: r.longitude, name };
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Reverse geocode coordinates → location name ───
async function reverseGeocodeLocation(lat: number, lon: number): Promise<string> {
  // Use BigDataCloud free client-side reverse geocoding (No API key, No CORS issues)
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const place = data.city || data.locality || data.principalSubdivision || '';
      const state = data.principalSubdivision || '';
      const country = data.countryName || '';
      
      // Attempt to return City, Country or City, State, Country
      if (place && place !== state) {
        return [place, state, country].filter(Boolean).join(', ');
      } else if (state) {
        return [state, country].filter(Boolean).join(', ');
      } else if (country) {
        return country;
      }
    }
  } catch { /* fall through */ }

  return 'Your Location';
}

// ──────────────────────────────────────────────────────
// Open-Meteo: Fetch full weather (FREE fallback)
// ──────────────────────────────────────────────────────

async function fetchOpenMeteoFull(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Open-Meteo request failed');
  const data = await response.json();

  const current = data.current_weather;
  const daily = data.daily;

  // Get the timezone offset from Open-Meteo (in seconds)
  const utcOffsetSeconds = data.utc_offset_seconds ?? 0;

  // Get current hour's humidity and rain probability
  const currentHourIndex = new Date().getHours();
  const humidity = data.hourly?.relativehumidity_2m?.[currentHourIndex] ?? 50;
  const rainProb = data.hourly?.precipitation_probability?.[currentHourIndex] ?? 0;

  // Build 7-day forecast
  const forecast: ForecastDay[] = [];
  for (let i = 0; i < daily.time.length; i++) {
    forecast.push({
      date: new Date(daily.time[i]),
      maxTemp: Math.round(daily.temperature_2m_max[i]),
      minTemp: Math.round(daily.temperature_2m_min[i]),
      condition: mapWMOCode(daily.weathercode[i]),
      rainProbability: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0,
    });
  }

  // Format sunrise/sunset as genuine UTC timestamps
  // Open-Meteo gives local ISO strings ("2026-03-24T06:21").
  // By treating them as UTC (appending 'Z'), we get the "local time as UTC" seconds.
  // To get the GENUINE UTC timestamp, we subtract the timezone's UTC offset.
  let sunriseTs: number | undefined;
  let sunsetTs: number | undefined;

  if (daily.sunrise?.[0]) {
    const localAsUtcSeconds = new Date(daily.sunrise[0] + 'Z').getTime() / 1000;
    sunriseTs = localAsUtcSeconds - utcOffsetSeconds;
  }
  if (daily.sunset?.[0]) {
    const localAsUtcSeconds = new Date(daily.sunset[0] + 'Z').getTime() / 1000;
    sunsetTs = localAsUtcSeconds - utcOffsetSeconds;
  }

  return {
    location: '',
    temperature: Math.round(current.temperature),
    condition: mapWMOCode(current.weathercode),
    humidity,
    windSpeed: Math.round(current.windspeed),
    rainProbability: rainProb,
    feelsLike: Math.round(current.temperature),
    description: getWeatherDescription(current.weathercode),
    timezoneOffset: utcOffsetSeconds, // Real UTC offset in seconds
    sunrise: sunriseTs,
    sunset: sunsetTs,
    forecast,
  };
}

// ──────────────────────────────────────────────────────
// Supabase: Try backend first (primary)
// ──────────────────────────────────────────────────────

async function fetchFromSupabase(body: Record<string, unknown>): Promise<WeatherData | null> {
  try {
    const { data, error } = await supabase.functions.invoke('get-weather', { body });

    if (error || data?.error) {
      console.warn('Supabase weather failed:', error?.message || data?.error);
      return null;
    }
    return data as WeatherData;
  } catch (err) {
    console.warn('Supabase weather error:', err);
    return null;
  }
}

/**
 * Merge Open-Meteo forecast + sunrise/sunset into Supabase weather data
 */
async function enrichWithOpenMeteo(baseData: WeatherData, lat: number, lon: number): Promise<WeatherData> {
  try {
    const openMeteo = await fetchOpenMeteoFull(lat, lon);
    return {
      ...baseData,
      forecast: openMeteo.forecast,
      sunrise: openMeteo.sunrise,
      sunset: openMeteo.sunset,
      timezoneOffset: openMeteo.timezoneOffset,
    };
  } catch {
    return baseData;
  }
}

// ──────────────────────────────────────────────────────
// PUBLIC API: fetchWeatherData & fetchWeatherByLocation
// Strategy: Supabase first → Open-Meteo fallback
// ──────────────────────────────────────────────────────

/**
 * Fetch weather data by city name.
 * Tries Supabase backend first; falls back to Open-Meteo (free) on error.
 */
export async function fetchWeatherData(city: string): Promise<WeatherData> {
  // Always geocode to get coordinates (needed for forecast/sunrise)
  const coords = await geocodeCity(city);

  // 1️⃣ Try Supabase first
  const supabaseData = await fetchFromSupabase({ city });
  if (supabaseData && coords) {
    const enriched = await enrichWithOpenMeteo(supabaseData, coords.lat, coords.lon);
    return enriched;
  }
  if (supabaseData) {
    return supabaseData;
  }

  // 2️⃣ Fallback: Open-Meteo directly
  console.log('Using Open-Meteo fallback for city:', city);
  if (!coords) {
    throw new Error(`Could not find location: ${city}`);
  }

  const weather = await fetchOpenMeteoFull(coords.lat, coords.lon);
  weather.location = coords.name;
  return weather;
}

/**
 * Fetch weather using geolocation coordinates.
 * Tries Supabase backend first; falls back to Open-Meteo (free) on error.
 */
export async function fetchWeatherByLocation(lat: number, lon: number): Promise<WeatherData> {
  // 1️⃣ Try Supabase first
  const supabaseData = await fetchFromSupabase({ lat, lon });
  if (supabaseData) {
    const enriched = await enrichWithOpenMeteo(supabaseData, lat, lon);
    return enriched;
  }

  // 2️⃣ Fallback: Open-Meteo directly
  console.log('Using Open-Meteo fallback for coordinates:', lat, lon);
  const weather = await fetchOpenMeteoFull(lat, lon);

  // Get proper location name (not coordinates)
  weather.location = await reverseGeocodeLocation(lat, lon);

  return weather;
}

/**
 * Get user's current location using browser geolocation API.
 * Returns coordinates if successful, null otherwise.
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
