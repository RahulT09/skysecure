export default async function handler(req, res) {
  try {
    const { lat, lon, property, depth, value } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Lat/Lon required' });
    }

    const soilUrl = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=${property}&depth=${depth}&value=${value}`;
    const response = await fetch(soilUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'SoilGrids API failed' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('[soilProxy] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
