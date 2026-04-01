/**
 * Air Quality API — Open-Meteo Air Quality (FREE, no key needed)
 * 
 * Fetches real-time AQI data including:
 * - US AQI (EPA standard)
 * - PM2.5, PM10 concentrations
 * - Pollen: Birch, Grass, Alder, Ragweed (grains/m³)
 * 
 * Derives conditions for: Pollen, Running, Driving difficulty
 */

export interface AirQualityData {
  aqi: number;
  aqiLabel: string;
  aqiColor: string;
  pm25: number;
  pm10: number;
  pollenLevel: string;
  pollenColor: string;
  runningCondition: string;
  runningScore: number;
  runningColor: string;
  drivingDifficulty: string;
  drivingColor: string;
}

// ─── AQI label/color mapping (EPA standard) ───

function getAqiInfo(aqi: number): { label: string; color: string } {
  if (aqi <= 50) return { label: 'Good', color: 'text-green-400' };
  if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-400' };
  if (aqi <= 150) return { label: 'Unhealthy (Sensitive)', color: 'text-orange-400' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-400' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-400' };
  return { label: 'Hazardous', color: 'text-rose-500' };
}

// ─── Derive pollen level from pollen grains data ───

function getPollenInfo(birch: number, grass: number, alder: number, ragweed: number): { level: string; color: string } {
  const maxPollen = Math.max(birch, grass, alder, ragweed);
  if (maxPollen <= 10) return { level: 'Very Low', color: 'text-green-400' };
  if (maxPollen <= 30) return { level: 'Low', color: 'text-green-300' };
  if (maxPollen <= 60) return { level: 'Moderate', color: 'text-yellow-400' };
  if (maxPollen <= 100) return { level: 'High', color: 'text-orange-400' };
  return { level: 'Very High', color: 'text-red-400' };
}

// ─── Derive running condition from AQI + PM2.5 ───

function getRunningInfo(aqi: number, pm25: number): { condition: string; score: number; color: string } {
  // Running score: lower is worse (inverted AQI)
  if (aqi <= 50) return { condition: 'Excellent', score: Math.max(0, 100 - aqi), color: 'text-green-400' };
  if (aqi <= 100) return { condition: 'Good', score: Math.max(0, 100 - Math.round(aqi * 0.6)), color: 'text-green-300' };
  if (aqi <= 150) return { condition: 'Fair', score: Math.max(0, 70 - Math.round((aqi - 100) * 0.4)), color: 'text-yellow-400' };
  if (aqi <= 200) return { condition: 'Poor', score: Math.max(0, 50 - Math.round((aqi - 150) * 0.5)), color: 'text-orange-400' };
  return { condition: 'Avoid Outdoor', score: Math.max(0, 25 - Math.round((aqi - 200) * 0.2)), color: 'text-red-400' };
}

// ─── Derive driving difficulty from PM10 + AQI (visibility proxy) ───

function getDrivingInfo(aqi: number, pm10: number): { difficulty: string; color: string } {
  // High PM10 and AQI reduce visibility
  const visibilityScore = aqi + pm10 * 0.5;
  if (visibilityScore <= 60) return { difficulty: 'None', color: 'text-green-400' };
  if (visibilityScore <= 120) return { difficulty: 'Low', color: 'text-yellow-400' };
  if (visibilityScore <= 200) return { difficulty: 'Moderate', color: 'text-orange-400' };
  if (visibilityScore <= 300) return { difficulty: 'High', color: 'text-red-400' };
  return { difficulty: 'Severe', color: 'text-rose-500' };
}

// ─── Public API ───

/**
 * Fetch real-time air quality data from Open-Meteo Air Quality API
 */
export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData> {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,birch_pollen,grass_pollen,alder_pollen,ragweed_pollen`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Air quality API failed: ${res.status}`);
    const data = await res.json();

    const current = data.current;
    const aqi = current?.us_aqi ?? 0;
    const pm25 = current?.pm2_5 ?? 0;
    const pm10 = current?.pm10 ?? 0;
    const birch = current?.birch_pollen ?? 0;
    const grass = current?.grass_pollen ?? 0;
    const alder = current?.alder_pollen ?? 0;
    const ragweed = current?.ragweed_pollen ?? 0;

    const aqiInfo = getAqiInfo(aqi);
    const pollenInfo = getPollenInfo(birch, grass, alder, ragweed);
    const runningInfo = getRunningInfo(aqi, pm25);
    const drivingInfo = getDrivingInfo(aqi, pm10);

    return {
      aqi,
      aqiLabel: aqiInfo.label,
      aqiColor: aqiInfo.color,
      pm25,
      pm10,
      pollenLevel: pollenInfo.level,
      pollenColor: pollenInfo.color,
      runningCondition: runningInfo.condition,
      runningScore: runningInfo.score,
      runningColor: runningInfo.color,
      drivingDifficulty: drivingInfo.difficulty,
      drivingColor: drivingInfo.color,
    };
  } catch (err) {
    console.warn('Air quality fetch failed, using defaults:', err);
    // Return safe defaults
    return {
      aqi: 0,
      aqiLabel: 'N/A',
      aqiColor: 'text-white/60',
      pm25: 0,
      pm10: 0,
      pollenLevel: 'N/A',
      pollenColor: 'text-white/60',
      runningCondition: 'N/A',
      runningScore: 0,
      runningColor: 'text-white/60',
      drivingDifficulty: 'N/A',
      drivingColor: 'text-white/60',
    };
  }
}
