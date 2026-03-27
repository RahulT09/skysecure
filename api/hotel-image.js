export default async function handler(req, res) {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const bingUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(q)}`;
    const response = await fetch(bingUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!response.ok) {
      console.error('[imageProxy] Web scrape failed with status:', response.status);
      return res.redirect(302, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop');
    }

    const htmlData = await response.text();
    const murlMatch = htmlData.match(/murl&quot;:&quot;(.*?)&quot;/);
    
    if (murlMatch && murlMatch[1]) {
      return res.redirect(302, murlMatch[1]);
    }

    console.warn('[imageProxy] No valid image found, falling back');
    return res.redirect(302, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop');
  } catch (err) {
    console.error('[imageProxy] Error:', err.message);
    return res.redirect(302, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop');
  }
}
