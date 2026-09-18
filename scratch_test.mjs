import https from 'https';

const query = `[out:json][timeout:25];area["ISO3166-2"="BR-RN"]->.state;area["name"="São Gonçalo do Amarante"](area.state)->.city;nwr["name"~"Barbearia", i](area.city);out center 30;`;
const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);

https.get(url, { headers: { 'User-Agent': 'GhostMarket/1.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', console.error);
