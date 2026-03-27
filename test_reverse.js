async function reverseGeocodeLocation(lat, lon) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      console.log('City:', data.city);
      console.log('Locality:', data.locality);
      console.log('Principal Sub:', data.principalSubdivision);
      console.log('Country:', data.countryName);
    } else {
        console.log('failed', res.status);
    }
  } catch (err) { console.log('err', err.message); }
}

reverseGeocodeLocation(19.076, 72.8777);
