const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

content = content.replace(/link\.match\(\/MLB-\?\(\\\\\\\\d\+\)\/i\)/, 'link.match(/MLB-?(\\\\d+)/i)');

fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
console.log('Regex fixed');
