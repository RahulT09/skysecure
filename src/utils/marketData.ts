import axios from 'axios';

/**
 * Market price entry for a crop
 */
export interface MarketPrice {
  crop: string;
  cropHi: string;
  price: number;    // ₹ per quintal
  emoji: string;
}

// ─── Mock fallback data (used when API is unavailable) ───
const MOCK_PRICES: MarketPrice[] = [
  { crop: 'Wheat',     cropHi: 'गेहूँ',    price: 2200, emoji: '🌾' },
  { crop: 'Rice',      cropHi: 'चावल',     price: 1800, emoji: '🍚' },
  { crop: 'Cotton',    cropHi: 'कपास',     price: 6500, emoji: '🌿' },
  { crop: 'Sugarcane', cropHi: 'गन्ना',    price: 350,  emoji: '🎋' },
  { crop: 'Soybean',   cropHi: 'सोयाबीन',  price: 4200, emoji: '🫛' },
  { crop: 'Maize',     cropHi: 'मक्का',    price: 1900, emoji: '🌽' },
  { crop: 'Mustard',   cropHi: 'सरसों',    price: 5050, emoji: '🌼' },
  { crop: 'Potato',    cropHi: 'आलू',      price: 1200, emoji: '🥔' },
];

function getCropEmoji(crop: string): string {
  const name = crop.toLowerCase();

  if (name.includes("wheat")) return "🌾";
  if (name.includes("rice") || name.includes("paddy")) return "🍚";
  if (name.includes("cotton")) return "🌿";
  if (name.includes("sugar") || name.includes("cane") || name.includes("gur") || name.includes("jaggery")) return "🎋";
  if (name.includes("soy") || name.includes("bean") || name.includes("gram") || name.includes("dal") || name.includes("lentil") || name.includes("chana") || name.includes("moong") || name.includes("urad") || name.includes("masoor")) return "🫛";
  if (name.includes("maize") || name.includes("corn") || name.includes("bajra") || name.includes("jowar") || name.includes("ragi") || name.includes("millet")) return "🌽";
  if (name.includes("mustard") || name.includes("sarso")) return "🌼";
  if (name.includes("potato") || name.includes("aloo")) return "🥔";
  if (name.includes("onion")) return "🧅";
  if (name.includes("tomato")) return "🍅";
  if (name.includes("chilli") || name.includes("pepper")) return "🌶️";
  if (name.includes("banana")) return "🍌";
  if (name.includes("mango")) return "🥭";
  if (name.includes("apple")) return "🍎";
  if (name.includes("coconut")) return "🥥";
  if (name.includes("groundnut") || name.includes("peanut")) return "🥜";
  if (name.includes("turmeric") || name.includes("haldi")) return "🟡";
  if (name.includes("garlic")) return "🧄";
  if (name.includes("ginger")) return "🫚";
  if (name.includes("tea")) return "🍵";
  if (name.includes("coffee")) return "☕";
  if (name.includes("jute")) return "🧵";
  if (name.includes("tobacco")) return "🍂";
  if (name.includes("rubber")) return "🌳";

  return "🌱";
}

/**
 * Fetch market prices from data.gov.in Agmarknet API.
 * Falls back to mock data if the API is unavailable or requires a key.
 *
 * @returns { prices, isMock }
 */
export async function fetchMarketPrices(): Promise<{
  prices: MarketPrice[];
  isMock: boolean;
}> {
  try {
    // data.gov.in Agmarknet endpoint (public, but often requires API key)
    const response = await axios.get(
      'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
      {
        params: {
          'api-key': '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
          format: 'json',
          limit: 10,
        },
        timeout: 6000,
      }
    );

    if (response.data?.records?.length > 0) {
      const livePrices: MarketPrice[] = response.data.records
        .slice(0, 8)
        .map((r: any) => ({
          crop: r.commodity || 'Unknown',
          cropHi: r.commodity || 'Unknown',
          price: parseInt(r.modal_price, 10) || 0,
          emoji: getCropEmoji(r.commodity || ""),
        }));
      return { prices: livePrices, isMock: false };
    }

    return { prices: MOCK_PRICES, isMock: true };
  } catch (error) {
    console.warn('Market price API failed, using mock data:', error);
    return { prices: MOCK_PRICES, isMock: true };
  }
}
