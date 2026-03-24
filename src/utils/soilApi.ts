import axios from 'axios';

/**
 * Soil data from the ISRIC SoilGrids API
 */
export interface SoilData {
  phLevel: number | null;      // pH × 10 (divide by 10 for display)
  clay: number | null;         // g/kg
  sand: number | null;         // g/kg
  silt: number | null;         // g/kg
  organicCarbon: number | null; // g/kg
}

/**
 * Fetch soil properties from the ISRIC SoilGrids REST API.
 * Uses the 0–5 cm depth layer mean values.
 *
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns SoilData or null if the API fails / CORS blocked
 */
export async function fetchSoilData(
  lat: number,
  lon: number
): Promise<SoilData | null> {
  try {
    const url = 'https://rest.isric.org/soilgrids/v2.0/properties/query';
    const response = await axios.get(url, {
      params: {
        lon: lon.toFixed(4),
        lat: lat.toFixed(4),
        property: ['phh2o', 'clay', 'sand', 'silt', 'soc'].join(','),
        depth: '0-5cm',
        value: 'mean',
      },
      timeout: 8000, // 8-second timeout
    });

    const layers = response.data?.properties?.layers;
    if (!layers || layers.length === 0) return null;

    // Helper to extract the mean value from a layer by name
    const getValue = (name: string): number | null => {
      const layer = layers.find((l: any) => l.name === name);
      const depth = layer?.depths?.[0];
      return depth?.values?.mean ?? null;
    };

    return {
      phLevel: getValue('phh2o'),
      clay: getValue('clay'),
      sand: getValue('sand'),
      silt: getValue('silt'),
      organicCarbon: getValue('soc'),
    };
  } catch (error) {
    console.warn('SoilGrids API failed (likely CORS or network):', error);
    return null;
  }
}
