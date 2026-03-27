async function testYahooImage(query) {
  try {
    const url = `https://images.search.yahoo.com/search/images?p=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const html = await res.text();
    const imgMatch = html.match(/imgurl=(.*?\.jpg|.*?\.png|.*?\.jpeg)/i);
    if (imgMatch && imgMatch[1]) {
      console.log('Yahoo Found:', decodeURIComponent(imgMatch[1]));
    } else {
        const altMatch = html.match(/src='(.*?)'/g);
        console.log('Yahoo possible sources:', altMatch?.slice(0, 3));
    }
  } catch (err) {
    console.error('Yahoo Error', err.message);
  }
}

async function testBingImage(query) {
  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const html = await res.text();
    const murlMatch = html.match(/murl&quot;:&quot;(.*?)&quot;/);
    if (murlMatch && murlMatch[1]) {
      console.log('Bing Found:', murlMatch[1]);
    } else {
      console.log('Bing Not Found');
    }
  } catch (err) {
    console.error('Bing Error', err.message);
  }
}

async function run() {
  await testBingImage("Taj Mahal Palace Hotel Mumbai exterior");
  await testYahooImage("Taj Mahal Palace Hotel Mumbai exterior");
}
run();
