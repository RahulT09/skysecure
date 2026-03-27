/**
 * Explore API — OpenStreetMap Overpass integration with mock fallback
 *
 * Uses the free Overpass API (no key required) for:
 *  - Nearby hotels  (tourism=hotel)
 *  - Nearby transport (railway=station, aeroway=aerodrome)
 *
 * Falls back to realistic mock data when API fails.
 */
import axios from 'axios';

// ─── Types ───
export interface HotelResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
  rating: number | null;
  imageUrl: string;
  address: string;
}

export interface TransportResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: 'railway' | 'airport';
  distance: string; // e.g. "2.3 km"
}

// ─── Constants ───
const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
];
const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop';

/**
 * Calculate approximate distance between two points (Haversine formula)
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Format distance in km
 */
function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)} km`;
}

// ─── Overpass helper ───

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

let overpassQueue: Promise<any> = Promise.resolve();

async function overpassQuery(query: string): Promise<OverpassElement[]> {
  // Queue the request to avoid 429 Too Many Requests from concurrent queries
  const executeQuery = async () => {
    // Add a small delay between requests to be extra safe
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Try each Overpass server in order until one succeeds
    let lastError: any = null;
    for (const url of OVERPASS_URLS) {
      try {
        const { data } = await axios.post(url, `data=${encodeURIComponent(query)}`, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          timeout: 20000,
        });
        return data.elements || [];
      } catch (err) {
        lastError = err;
        console.warn(`Overpass server ${url} failed, trying next...`);
        // Brief pause before trying the next server
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
    throw lastError;
  };

  const nextPromise = overpassQueue.then(executeQuery).catch(executeQuery);
  overpassQueue = nextPromise;
  return nextPromise;
}

/**
 * Helper to extract lat/lon from a node or way element
 */
function getCoords(el: OverpassElement): { lat: number; lon: number } | null {
  if (el.lat !== undefined && el.lon !== undefined) return { lat: el.lat, lon: el.lon };
  if (el.center) return { lat: el.center.lat, lon: el.center.lon };
  return null;
}

// ─── Public API ───

/**
 * Fetch nearby hotels (live Overpass API or mock fallback)
 */
export async function fetchNearbyHotels(lat: number, lon: number): Promise<HotelResult[]> {
  try {
    const query = `[out:json][timeout:15];(node["tourism"="hotel"](around:5000,${lat},${lon});way["tourism"="hotel"](around:5000,${lat},${lon}););out center 6;`;
    const elements = await overpassQuery(query);

    if (elements.length === 0) {
      console.warn('Overpass returned 0 hotels, using mock data');
      return getMockHotels(lat, lon);
    }

    return elements.map((el, i) => {
      const coords = getCoords(el);
      const elLat = coords?.lat ?? lat + (Math.random() - 0.5) * 0.02;
      const elLon = coords?.lon ?? lon + (Math.random() - 0.5) * 0.02;
      const tags = el.tags || {};

      // Build a readable address from available tags
      const addressParts = [tags['addr:street'], tags['addr:city']].filter(Boolean);
      const address = addressParts.length > 0 ? addressParts.join(', ') : 'Nearby';

      // Build a meaningful name even if the OSM node has no name tag
      let name = tags.name || tags['name:en'] || '';
      if (!name) {
        if (tags.brand) name = tags.brand;
        else if (tags['addr:street']) name = `Hotel on ${tags['addr:street']}`;
        else name = `Hotel #${i + 1}`;
      }

      // Generate dynamic real image URL via local Vite proxy plugin
      const imageQuery = `${name} ${tags['addr:city'] || ''} hotel exterior`;
      const imageUrl = `/api/hotel-image?q=${encodeURIComponent(imageQuery.trim())}`;

      return {
        id: `osm-${el.id}`,
        name,
        lat: elLat,
        lon: elLon,
        rating: tags.stars ? parseFloat(tags.stars) : null,
        imageUrl,
        address,
      };
    });
  } catch (err) {
    console.warn('Overpass hotels failed, using mock data', err);
    return getMockHotels(lat, lon);
  }
}

/**
 * Fetch nearby transport hubs (live Overpass API or mock fallback)
 * Railways and airports are fetched independently so one failing doesn't block the other.
 */
export async function fetchNearbyTransport(lat: number, lon: number): Promise<TransportResult[]> {
  const results: TransportResult[] = [];

  // ─── Railways (separate query — broader tags, 15km radius) ───
  try {
    const railQuery = `[out:json][timeout:15];(node["railway"~"station|halt|stop"](around:15000,${lat},${lon});way["railway"~"station|halt|stop"](around:15000,${lat},${lon}););out center 5;`;
    const railElements = await overpassQuery(railQuery);

    railElements.forEach((el, i) => {
      const coords = getCoords(el);
      if (!coords) return;
      const tags = el.tags || {};
      const name = tags.name || tags['name:en'] || tags.description || `Railway Station #${i + 1}`;
      results.push({
        id: `osm-${el.id}`,
        name,
        lat: coords.lat,
        lon: coords.lon,
        type: 'railway',
        distance: formatDistance(haversineDistance(lat, lon, coords.lat, coords.lon)),
      });
    });
  } catch (err) {
    console.warn('Overpass railways query failed:', err);
  }

  // ─── Airports (separate query — broader tags, 50km radius) ───
  try {
    const airQuery = `[out:json][timeout:15];(node["aeroway"~"aerodrome|terminal"](around:50000,${lat},${lon});way["aeroway"~"aerodrome|terminal"](around:50000,${lat},${lon}););out center 3;`;
    const airElements = await overpassQuery(airQuery);

    airElements.forEach((el, i) => {
      const coords = getCoords(el);
      if (!coords) return;
      const tags = el.tags || {};
      const name = tags.name || tags['name:en'] || tags.iata || `Airport #${i + 1}`;
      // Avoid duplicate terminals inside the same airport
      if (results.some((r) => r.name === name)) return;
      results.push({
        id: `osm-${el.id}`,
        name,
        lat: coords.lat,
        lon: coords.lon,
        type: 'airport',
        distance: formatDistance(haversineDistance(lat, lon, coords.lat, coords.lon)),
      });
    });
  } catch (err) {
    console.warn('Overpass airports query failed:', err);
  }

  // If both queries returned nothing, use mock data
  if (results.length === 0) {
    console.warn('No transport data from Overpass, using mock data');
    return getMockTransport(lat, lon);
  }

  return results;
}

// ─── Mock data fallbacks ───

function getMockHotels(lat: number, lon: number): HotelResult[] {
  const offsets = [
    { name: 'Hotel Sunrise Grand', dlat: 0.008, dlon: 0.012 },
    { name: 'The Royal Residency', dlat: -0.005, dlon: 0.009 },
    { name: 'Paradise Inn',        dlat: 0.012, dlon: -0.007 },
    { name: 'City Comfort Suites', dlat: -0.01, dlon: -0.015 },
    { name: 'Lakeside Resort',     dlat: 0.015, dlon: 0.005 },
    { name: 'Budget Stay Express', dlat: -0.003, dlon: 0.018 },
  ];
  return offsets.map((h, i) => {
    const imageUrl = `/api/hotel-image?q=${encodeURIComponent(h.name + ' exterior')}`;
    return {
      id: `mock-hotel-${i}`,
      name: h.name,
      lat: lat + h.dlat,
      lon: lon + h.dlon,
      rating: +(3.5 + Math.random() * 1.5).toFixed(1),
      imageUrl,
      address: 'Near city center',
    };
  });
}

function getMockTransport(lat: number, lon: number): TransportResult[] {
  return [
    {
      id: 'mock-rail-1',
      name: 'Central Railway Station',
      lat: lat + 0.02,
      lon: lon + 0.01,
      type: 'railway',
      distance: formatDistance(haversineDistance(lat, lon, lat + 0.02, lon + 0.01)),
    },
    {
      id: 'mock-rail-2',
      name: 'Junction Railway Station',
      lat: lat - 0.015,
      lon: lon + 0.02,
      type: 'railway',
      distance: formatDistance(haversineDistance(lat, lon, lat - 0.015, lon + 0.02)),
    },
    {
      id: 'mock-air-1',
      name: 'Domestic Airport',
      lat: lat + 0.05,
      lon: lon - 0.03,
      type: 'airport',
      distance: formatDistance(haversineDistance(lat, lon, lat + 0.05, lon - 0.03)),
    },
  ];
}

/**
 * Build a Google Maps directions URL using a place name for the destination.
 * Omitting 'origin' natively forces Google Maps to route from the user's live device location.
 */
export function getDirectionsUrl(fromLat: number, fromLon: number, destinationName: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationName)}&travelmode=driving`;
}
