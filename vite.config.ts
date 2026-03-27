import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Custom Vite plugin to act as a CORS-free backend proxy for image scraping
function imageProxyPlugin(): Plugin {
  return {
    name: 'image-proxy',
    configureServer(server) {
      server.middlewares.use('/api/hotel-image', async (req, res) => {
        try {
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const query = url.searchParams.get('q');
          
          if (!query) {
            res.statusCode = 400;
            return res.end('Query parameter "q" is required');
          }

          const bingUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2`;
          // Use natural Node.js fetch (Node 18+)
          const response = await fetch(bingUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
            }
          });
          
          const html = await response.text();
          const murlMatch = html.match(/murl&quot;:&quot;(.*?)&quot;/);
          
          if (murlMatch && murlMatch[1]) {
            // Redirect straight to the scraped image URL
            res.statusCode = 302;
            res.setHeader('Location', murlMatch[1]);
            return res.end();
          } else {
            // Placeholder fallback if no image found
            res.statusCode = 302;
            res.setHeader('Location', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop');
            return res.end();
          }
        } catch (err: any) {
          console.error('[imageProxyPlugin] Error:', err.message);
          res.statusCode = 302;
          res.setHeader('Location', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop');
          return res.end();
        }
      });

      // Custom Vite proxy for highly accurate forward geocoding (OpenStreetMap Nominatim)
      server.middlewares.use('/api/geocode', async (req, res) => {
        try {
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const query = url.searchParams.get('q');
          
          if (!query) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Query parameter "q" is required' }));
          }

          // Nominatim strictly requires a descriptive User-Agent
          const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
          const response = await fetch(nomUrl, {
            headers: {
              'User-Agent': 'SkySecure-WeatherApp-Local/1.0',
              'Accept-Language': 'en-US'
            }
          });

          if (!response.ok) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: 'Nominatim API failed' }));
          }

          const data = await response.json();
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(data));
        } catch (err: any) {
          console.error('[geocodeProxy] Error:', err.message);
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: err.message }));
        }
      });

      // Custom Vite proxy for SoilGrids API (bypasses CORS restrictions)
      server.middlewares.use('/api/soil', async (req, res) => {
        try {
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const lat = url.searchParams.get('lat');
          const lon = url.searchParams.get('lon');
          const property = url.searchParams.get('property');
          const depth = url.searchParams.get('depth');
          const value = url.searchParams.get('value');

          if (!lat || !lon) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Lat/Lon required' }));
          }

          const soilUrl = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=${property}&depth=${depth}&value=${value}`;
          const response = await fetch(soilUrl, {
            headers: {
              'Accept': 'application/json'
            }
          });

          if (!response.ok) {
            res.statusCode = response.status;
            return res.end(JSON.stringify({ error: 'SoilGrids API failed' }));
          }

          const data = await response.json();
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(data));
        } catch (err: any) {
          console.error('[soilProxy] Error:', err.message);
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    imageProxyPlugin()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
