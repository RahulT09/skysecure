import { WeatherData, WeatherCondition, ForecastDay } from '@/types/weather';

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
export async function geocodeCity(city: string): Promise<{ lat: number; lon: number; name: string } | null> {
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

        // Build "Suburb, City" or "City, State" — deduplicate adjacent same-name parts
        const parts = r.display_name.split(',').map((p: string) => p.trim());
        // Remove adjacent duplicates (e.g. "Mumbai, Mumbai" → keep one)
        const unique = parts.filter((p: string, i: number) => i === 0 || p.toLowerCase() !== parts[i - 1].toLowerCase());
        // Take first 2 unique parts (suburb+city or city+state)
        const shortName = unique.slice(0, 2).join(', ');

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

      // Only City, State — no country
      const name = [r.name, r.admin1].filter(Boolean).join(', ');
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
      const locality = data.locality || '';
      const city = data.city || '';
      const state = data.principalSubdivision || '';
      
      // Build "Suburb, City" or "City, State" format
      // If locality differs from city, show "Locality, City" (e.g. "Borivali, Mumbai")
      // Otherwise show "City, State" (e.g. "Mumbai, Maharashtra")
      if (locality && city && locality.toLowerCase() !== city.toLowerCase()) {
        return `${locality}, ${city}`;
      } else if (city && state && city.toLowerCase() !== state.toLowerCase()) {
        return `${city}, ${state}`;
      } else if (city) {
        return city;
      } else if (state) {
        return state;
      }
    }
  } catch { /* fall through */ }

  return 'Your Location';
}

// ──────────────────────────────────────────────────────
// OpenWeatherMap: Primary weather API
// ──────────────────────────────────────────────────────

const OWM_API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY || '';

/**
 * Map OpenWeatherMap main condition to our weather types
 */
function mapOWMCondition(main: string): WeatherCondition {
  const m = main.toLowerCase();
  if (m.includes('clear')) return 'sunny';
  if (m.includes('cloud')) return 'cloudy';
  if (m.includes('rain') || m.includes('drizzle')) return 'rainy';
  if (m.includes('thunder')) return 'stormy';
  if (m.includes('snow')) return 'snowy';
  if (m.includes('mist') || m.includes('fog') || m.includes('haze') || m.includes('smoke')) return 'foggy';
  if (m.includes('wind') || m.includes('squall') || m.includes('tornado')) return 'windy';
  return 'cloudy';
}

/**
 * Fetch weather from OpenWeatherMap (current + 5-day forecast)
 */
async function fetchFromOpenWeatherMap(lat: number, lon: number): Promise<WeatherData> {
  if (!OWM_API_KEY) throw new Error('OpenWeatherMap API key not configured');

  // Fetch current weather and 5-day/3-hour forecast in parallel
  const [currentRes, forecastRes] = await Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric`),
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric`),
  ]);

  if (!currentRes.ok) throw new Error(`OpenWeatherMap current weather failed: ${currentRes.status}`);
  const currentData = await currentRes.json();

  // Build forecast from 5-day/3-hour data → group by day
  const forecast: ForecastDay[] = [];
  if (forecastRes.ok) {
    const forecastData = await forecastRes.json();
    const dailyMap = new Map<string, { temps: number[]; mins: number[]; codes: string[]; rain: number[] }>();

    for (const item of forecastData.list || []) {
      const dateKey = item.dt_txt?.split(' ')[0];
      if (!dateKey) continue;
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { temps: [], mins: [], codes: [], rain: [] });
      }
      const day = dailyMap.get(dateKey)!;
      day.temps.push(item.main.temp_max);
      day.mins.push(item.main.temp_min);
      day.codes.push(item.weather?.[0]?.main || 'Clouds');
      day.rain.push(item.pop ? item.pop * 100 : 0);
    }

    let count = 0;
    for (const [dateStr, day] of dailyMap) {
      if (count >= 7) break;
      forecast.push({
        date: new Date(dateStr),
        maxTemp: Math.round(Math.max(...day.temps)),
        minTemp: Math.round(Math.min(...day.mins)),
        condition: mapOWMCondition(day.codes[Math.floor(day.codes.length / 2)]),
        rainProbability: Math.round(Math.max(...day.rain)),
      });
      count++;
    }
  }

  return {
    location: '',
    temperature: Math.round(currentData.main.temp),
    condition: mapOWMCondition(currentData.weather?.[0]?.main || 'Clouds'),
    humidity: currentData.main.humidity,
    windSpeed: Math.round((currentData.wind?.speed || 0) * 3.6), // m/s → km/h
    rainProbability: forecast[0]?.rainProbability ?? 0,
    feelsLike: Math.round(currentData.main.feels_like),
    description: currentData.weather?.[0]?.description || 'Unknown',
    timezoneOffset: currentData.timezone ?? 0,
    sunrise: currentData.sys?.sunrise,
    sunset: currentData.sys?.sunset,
    forecast,
  };
}

// ──────────────────────────────────────────────────────
// Open-Meteo: Backup fallback weather API (FREE, no key)
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
    timezoneOffset: utcOffsetSeconds,
    sunrise: sunriseTs,
    sunset: sunsetTs,
    forecast,
  };
}

// ──────────────────────────────────────────────────────
// PUBLIC API: fetchWeatherData & fetchWeatherByLocation
// Strategy: OpenWeatherMap first → Open-Meteo fallback
// ──────────────────────────────────────────────────────

/**
 * Fetch weather data by city name.
 * Tries OpenWeatherMap first; falls back to Open-Meteo (free) on error.
 */
export async function fetchWeatherData(city: string): Promise<WeatherData> {
  // Always geocode to get coordinates
  const coords = await geocodeCity(city);

  if (!coords) {
    throw new Error(`Could not find location: ${city}`);
  }

  // 1️⃣ Try OpenWeatherMap (primary)
  try {
    console.log('Fetching weather from OpenWeatherMap for:', city);
    const weather = await fetchFromOpenWeatherMap(coords.lat, coords.lon);
    weather.location = coords.name;
    return weather;
  } catch (err) {
    console.warn('OpenWeatherMap failed, falling back to Open-Meteo:', err);
  }

  // 2️⃣ Fallback: Open-Meteo
  console.log('Using Open-Meteo fallback for city:', city);
  const weather = await fetchOpenMeteoFull(coords.lat, coords.lon);
  weather.location = coords.name;
  return weather;
}

/**
 * Fetch weather using geolocation coordinates.
 * Tries OpenWeatherMap first; falls back to Open-Meteo (free) on error.
 */
export async function fetchWeatherByLocation(lat: number, lon: number): Promise<WeatherData> {
  const locationName = reverseGeocodeLocation(lat, lon);

  // 1️⃣ Try OpenWeatherMap (primary)
  try {
    console.log('Fetching weather from OpenWeatherMap for coords:', lat, lon);
    const weather = await fetchFromOpenWeatherMap(lat, lon);
    weather.location = await locationName;
    return weather;
  } catch (err) {
    console.warn('OpenWeatherMap failed, falling back to Open-Meteo:', err);
  }

  // 2️⃣ Fallback: Open-Meteo
  console.log('Using Open-Meteo fallback for coordinates:', lat, lon);
  const weather = await fetchOpenMeteoFull(lat, lon);
  weather.location = await locationName;
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
