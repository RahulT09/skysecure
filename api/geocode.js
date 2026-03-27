export default async function handler(req, res) {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`;
    const response = await fetch(nomUrl, {
      headers: {
        'User-Agent': 'SkySecure-WeatherApp-Production/1.0',
        'Accept-Language': 'en-US'
      }
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Nominatim API failed' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('[geocodeProxy] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
