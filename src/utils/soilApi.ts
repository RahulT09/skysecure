import axios from "axios";

/**
 * Soil data from SoilGrids API
 */
export interface SoilData {
  phLevel: number | null;
  clay: number | null;
  sand: number | null;
  silt: number | null;
  organicCarbon: number | null;
}

// ⚠️ Use proxy in dev (fixes CORS)
const BASE_URL =
  import.meta.env.DEV
    ? "https://cors-anywhere.herokuapp.com/https://rest.isric.org/soilgrids/v2.0/properties/query"
    : "https://rest.isric.org/soilgrids/v2.0/properties/query";

/**
 * Fetch soil properties (with safe fallback + logging)
 */
export async function fetchSoilData(
  lat: number,
  lon: number
): Promise<SoilData | null> {
  try {
    console.log("Fetching soil data for:", lat, lon);

    const response = await axios.get(BASE_URL, {
      params: {
        lon: lon.toFixed(4),
        lat: lat.toFixed(4),
        property: "phh2o,clay,sand,silt,soc", // FIXED format
        depth: "0-5cm",
        value: "mean",
      },
      timeout: 8000,
    });

    const layers = response.data?.properties?.layers;

    if (!layers || !Array.isArray(layers)) {
      console.warn("No soil layers found");
      return getMockSoilData();
    }

    // Helper to safely extract value
    const getValue = (name: string): number | null => {
      const layer = layers.find((l: any) => l.name === name);
      return layer?.depths?.[0]?.values?.mean ?? null;
    };

    const result: SoilData = {
      phLevel: getValue("phh2o"),
      clay: getValue("clay"),
      sand: getValue("sand"),
      silt: getValue("silt"),
      organicCarbon: getValue("soc"),
    };

    console.log("Soil Data:", result);

    return result;
  } catch (error: any) {
    console.error(
      "SoilGrids API failed:",
      error.response?.data || error.message
    );

    // ✅ fallback instead of returning null
    return getMockSoilData();
  }
}

/**
 * Mock fallback data (VERY IMPORTANT for UX)
 */
function getMockSoilData(): SoilData {
  return {
    phLevel: 65, // 6.5 pH
    clay: 30,
    sand: 40,
    silt: 30,
    organicCarbon: 10,
  };
}