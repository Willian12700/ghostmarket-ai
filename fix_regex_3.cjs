const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

// The file currently has 2 slashes: \\d
// We want 1 slash: \d
// In a JS string, 2 slashes is "\\\\d". 1 slash is "\\d".
content = content.replace("link.match(/MLB-?(\\\\d+)/i)", "link.match(/MLB-?(\\d+)/i)");

fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
console.log('Regex fixed manually');
