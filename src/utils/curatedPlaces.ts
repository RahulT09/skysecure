/**
 * Curated Tourist Places Dataset
 * Hardcoded data for popular destinations across Indian cities.
 * Each place has coordinates, description, and indoor/outdoor tag
 * for weather-based filtering.
 */

export interface CuratedPlace {
  name: string;
  lat: number;
  lon: number;
  description: string;
  type: 'indoor' | 'outdoor';
  emoji: string;
}

export interface CityData {
  lat: number;
  lon: number;
  places: CuratedPlace[];
}

// ─── Curated places by city (lowercase keys) ───
export const curatedPlaces: Record<string, CityData> = {
  borivali: {
    lat: 19.2288,
    lon: 72.8544,
    places: [
      { name: 'Sanjay Gandhi National Park', lat: 19.2147, lon: 72.9107, description: 'Sprawling national park with wildlife safaris and ancient caves', type: 'outdoor', emoji: '🌳' },
      { name: 'Kanheri Caves', lat: 19.2094, lon: 72.9068, description: 'Ancient Buddhist rock-cut caves dating to 1st century BCE', type: 'outdoor', emoji: '🏛️' },
      { name: 'Gorai Beach', lat: 19.2318, lon: 72.7963, description: 'Serene beach escape away from the city bustle', type: 'outdoor', emoji: '🏖️' },
      { name: 'EsselWorld', lat: 19.2327, lon: 72.8012, description: 'Indias largest amusement park with thrilling rides', type: 'outdoor', emoji: '🎢' },
      { name: 'Water Kingdom', lat: 19.2341, lon: 72.8023, description: 'Asia\'s largest theme water park', type: 'outdoor', emoji: '🌊' },
      { name: 'Global Vipassana Pagoda', lat: 19.2295, lon: 72.8089, description: 'Stunning golden dome meditation hall', type: 'indoor', emoji: '🕌' },
    ],
  },
  mumbai: {
    lat: 19.076,
    lon: 72.8777,
    places: [
      { name: 'Gateway of India', lat: 19.0402, lon: 72.8347, description: 'Iconic arch monument overlooking the Arabian Sea', type: 'outdoor', emoji: '🏛️' },
      { name: 'Marine Drive', lat: 18.9432, lon: 72.8235, description: 'Scenic 3.6 km promenade along the coast', type: 'outdoor', emoji: '🌊' },
      { name: 'Chhatrapati Shivaji Terminus', lat: 18.9398, lon: 72.8355, description: 'UNESCO heritage Victorian Gothic railway station', type: 'indoor', emoji: '🚂' },
      { name: 'Elephanta Caves', lat: 18.9633, lon: 72.9315, description: 'UNESCO World Heritage Site with ancient sculptures', type: 'outdoor', emoji: '🗿' },
      { name: 'Siddhivinayak Temple', lat: 19.0169, lon: 72.8302, description: 'Famous Hindu temple dedicated to Lord Ganesha', type: 'indoor', emoji: '🛕' },
      { name: 'Juhu Beach', lat: 19.0988, lon: 72.8267, description: 'Popular beach known for street food and sunsets', type: 'outdoor', emoji: '🏖️' },
    ],
  },
  delhi: {
    lat: 28.6139,
    lon: 77.209,
    places: [
      { name: 'India Gate', lat: 28.6129, lon: 77.2295, description: 'War memorial and iconic landmark of the capital', type: 'outdoor', emoji: '🏛️' },
      { name: 'Red Fort', lat: 28.6562, lon: 77.241, description: 'UNESCO heritage Mughal-era fort complex', type: 'outdoor', emoji: '🏰' },
      { name: 'Qutub Minar', lat: 28.5245, lon: 77.1855, description: 'Tallest brick minaret in the world, 73m tall', type: 'outdoor', emoji: '🗼' },
      { name: 'Lotus Temple', lat: 28.5535, lon: 77.2588, description: 'Stunning flower-shaped Bahai House of Worship', type: 'indoor', emoji: '🪷' },
      { name: 'National Museum', lat: 28.6117, lon: 77.2194, description: 'India\'s largest museum with 200,000+ artifacts', type: 'indoor', emoji: '🏛️' },
      { name: 'Humayuns Tomb', lat: 28.5933, lon: 77.2507, description: 'Mughal architecture masterpiece, precursor to Taj Mahal', type: 'outdoor', emoji: '🕌' },
    ],
  },
  jaipur: {
    lat: 26.9124,
    lon: 75.7873,
    places: [
      { name: 'Hawa Mahal', lat: 26.9239, lon: 75.8267, description: 'Palace of Winds with 953 small windows', type: 'outdoor', emoji: '🏰' },
      { name: 'Amber Fort', lat: 26.9855, lon: 75.8513, description: 'Majestic hilltop fort with stunning mirror work', type: 'outdoor', emoji: '🏰' },
      { name: 'City Palace', lat: 26.9258, lon: 75.8237, description: 'Royal palace complex blending Rajasthani and Mughal architecture', type: 'indoor', emoji: '👑' },
      { name: 'Jantar Mantar', lat: 26.9248, lon: 75.8242, description: 'UNESCO heritage astronomical observation site', type: 'outdoor', emoji: '🔭' },
      { name: 'Nahargarh Fort', lat: 26.9372, lon: 75.8154, description: 'Hilltop fort offering panoramic views of the Pink City', type: 'outdoor', emoji: '🏔️' },
    ],
  },
  goa: {
    lat: 15.2993,
    lon: 74.124,
    places: [
      { name: 'Baga Beach', lat: 15.5559, lon: 73.7515, description: 'Famous beach known for nightlife and water sports', type: 'outdoor', emoji: '🏖️' },
      { name: 'Basilica of Bom Jesus', lat: 15.5009, lon: 73.9116, description: 'UNESCO World Heritage baroque church from 1605', type: 'indoor', emoji: '⛪' },
      { name: 'Dudhsagar Falls', lat: 15.3144, lon: 74.3143, description: 'Spectacular 310m four-tiered waterfall', type: 'outdoor', emoji: '💧' },
      { name: 'Fort Aguada', lat: 15.4924, lon: 73.7735, description: '17th-century Portuguese fort and lighthouse', type: 'outdoor', emoji: '🏰' },
      { name: 'Anjuna Flea Market', lat: 15.5736, lon: 73.7413, description: 'Vibrant weekly market with crafts, clothes and food', type: 'outdoor', emoji: '🛍️' },
    ],
  },
  bangalore: {
    lat: 12.9716,
    lon: 77.5946,
    places: [
      { name: 'Lalbagh Botanical Garden', lat: 12.9507, lon: 77.5848, description: 'Historic 240-acre garden with rare plants and glass house', type: 'outdoor', emoji: '🌺' },
      { name: 'Bangalore Palace', lat: 12.9987, lon: 77.592, description: 'Tudor-style palace inspired by Windsor Castle', type: 'indoor', emoji: '🏰' },
      { name: 'Cubbon Park', lat: 12.9763, lon: 77.5929, description: 'Green lung of Bangalore spanning 300 acres', type: 'outdoor', emoji: '🌳' },
      { name: 'ISKCON Temple', lat: 12.9716, lon: 77.5511, description: 'Largest ISKCON temple in the world', type: 'indoor', emoji: '🛕' },
      { name: 'Nandi Hills', lat: 13.3702, lon: 77.6835, description: 'Scenic hilltop retreat famous for sunrise views', type: 'outdoor', emoji: '🏔️' },
    ],
  },
  kolkata: {
    lat: 22.5726,
    lon: 88.3639,
    places: [
      { name: 'Victoria Memorial', lat: 22.5448, lon: 88.3426, description: 'Stunning white marble monument and museum', type: 'outdoor', emoji: '🏛️' },
      { name: 'Howrah Bridge', lat: 22.5851, lon: 88.3468, description: 'Iconic cantilever bridge over the Hooghly River', type: 'outdoor', emoji: '🌉' },
      { name: 'Indian Museum', lat: 22.5583, lon: 88.3509, description: 'Oldest and largest museum in India, founded 1814', type: 'indoor', emoji: '🏛️' },
      { name: 'Dakshineswar Kali Temple', lat: 22.6547, lon: 88.3575, description: 'Famous 19th-century temple on the banks of Hooghly', type: 'indoor', emoji: '🛕' },
      { name: 'Park Street', lat: 22.5513, lon: 88.3636, description: 'Heritage street famous for restaurants and nightlife', type: 'outdoor', emoji: '🎶' },
    ],
  },
  hyderabad: {
    lat: 17.385,
    lon: 78.4867,
    places: [
      { name: 'Charminar', lat: 17.3616, lon: 78.4747, description: 'Iconic monument and mosque built in 1591', type: 'outdoor', emoji: '🕌' },
      { name: 'Golconda Fort', lat: 17.3833, lon: 78.4011, description: 'Medieval fort famous for its acoustic architecture', type: 'outdoor', emoji: '🏰' },
      { name: 'Ramoji Film City', lat: 17.2543, lon: 78.6808, description: 'Worlds largest integrated film studio complex', type: 'indoor', emoji: '🎬' },
      { name: 'Hussain Sagar Lake', lat: 17.4239, lon: 78.4738, description: 'Heart-shaped lake with a giant Buddha statue', type: 'outdoor', emoji: '🗿' },
      { name: 'Salar Jung Museum', lat: 17.3713, lon: 78.4804, description: 'One of the largest one-man art collections in the world', type: 'indoor', emoji: '🖼️' },
    ],
  },
  andheri: {
    lat: 19.1136,
    lon: 72.8697,
    places: [
      { name: 'Film City', lat: 19.1629, lon: 72.8684, description: 'Bollywood film studio complex in Goregaon', type: 'indoor', emoji: '🎬' },
      { name: 'Versova Beach', lat: 19.1347, lon: 72.8122, description: 'Quiet beach popular with locals and joggers', type: 'outdoor', emoji: '🏖️' },
      { name: 'Infinity Mall', lat: 19.1358, lon: 72.8290, description: 'Popular shopping and entertainment destination', type: 'indoor', emoji: '🛍️' },
      { name: 'Gilbert Hill', lat: 19.1286, lon: 72.8404, description: 'Rare 66-million-year-old volcanic rock column', type: 'outdoor', emoji: '🪨' },
    ],
  },
  pune: {
    lat: 18.5204,
    lon: 73.8567,
    places: [
      { name: 'Shaniwar Wada', lat: 18.5195, lon: 73.8553, description: 'Historic fortification and seat of the Peshwa rulers', type: 'outdoor', emoji: '🏰' },
      { name: 'Aga Khan Palace', lat: 18.5526, lon: 73.9017, description: 'Historic palace where Mahatma Gandhi was imprisoned', type: 'indoor', emoji: '🏛️' },
      { name: 'Sinhagad Fort', lat: 18.3659, lon: 73.7557, description: 'Ancient hilltop fortress with panoramic views', type: 'outdoor', emoji: '🏔️' },
      { name: 'Dagdusheth Halwai Ganpati Temple', lat: 18.5163, lon: 73.856, description: 'Iconic Ganpati temple built in 1893', type: 'indoor', emoji: '🛕' },
      { name: 'Osho Ashram', lat: 18.5386, lon: 73.8942, description: 'World-famous meditation and wellness resort', type: 'indoor', emoji: '🧘' },
    ],
  },
};

/**
 * Search for a city in the curated dataset
 * Matches partial names (e.g., "borival" matches "borivali")
 */
export function findCity(query: string): { key: string; data: CityData } | null {
  const q = query.toLowerCase().trim();
  // Exact match first
  if (curatedPlaces[q]) return { key: q, data: curatedPlaces[q] };
  // Partial match
  for (const [key, data] of Object.entries(curatedPlaces)) {
    if (key.includes(q) || q.includes(key)) return { key, data };
  }
  return null;
}

/**
 * Get all available city names for display
 */
export function getAvailableCities(): string[] {
  return Object.keys(curatedPlaces).map(
    (c) => c.charAt(0).toUpperCase() + c.slice(1)
  );
}
