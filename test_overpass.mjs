import axios from 'axios';

async function testOverpass() {
  const lat = 19.076;
  const lon = 72.8777;
  
  // Try alternative endpoint
  const ENDPOINT = 'https://lz4.overpass-api.de/api/interpreter';
  
  const headers = {
    'User-Agent': 'SkySecure-WeatherApp/1.0',
    'Accept': 'application/json'
  };
  
  try {
    const hotelQuery = `[out:json][timeout:15];(node["tourism"="hotel"](around:15000,${lat},${lon});way["tourism"="hotel"](around:15000,${lat},${lon}););out center 6;`;
    const res = await axios.get(ENDPOINT, { params: { data: hotelQuery }, headers });
    console.log("Hotels returned elements:", res.data.elements?.length || 0);
  } catch(e) {
    console.error("Hotel query failed:", e.message);
  }

  try {
    const railQuery = `[out:json][timeout:15];(node["railway"~"station|halt|stop"](around:15000,${lat},${lon});way["railway"~"station|halt|stop"](around:15000,${lat},${lon}););out center 5;`;
    const res = await axios.get(ENDPOINT, { params: { data: railQuery }, headers });
    console.log("Railways returned elements:", res.data.elements?.length || 0);
  } catch(e) {
    console.error("Railway query failed:", e.message);
  }
}

testOverpass();
