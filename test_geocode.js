async function testGeocode(city) {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.results) {
        console.log(`Results for ${city}:`);
        data.results.forEach(r => {
            console.log(`- ${r.name}, ${r.admin1 || ''}, ${r.country || ''} (${r.latitude}, ${r.longitude})`);
        });
    } else {
        console.log(`No results for ${city}`);
    }
  } catch(e) { console.error(e.message); }
}

async function run() {
    await testGeocode("Mira road");
    await testGeocode("Mira road, India");
    await testGeocode("Nerul");
}
run();
