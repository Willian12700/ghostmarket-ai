const fetch = require('node-fetch'); // wait, built-in fetch in node 18+

async function run() {
  const query = `
    [out:json][timeout:25];
    area["name"="São Paulo"]->.searchArea;
    node["shop"~"hairdresser|beauty"](area.searchArea);
    out center 5;
  `;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
