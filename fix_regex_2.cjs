const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

content = content.replace("link.match(/MLB-?(\\\\d+)/i)", "link.match(/MLB-?(\\\\d+)/i)");
// Wait, to put ONE backslash in JS string literal, we need two backslashes.
content = content.replace("link.match(/MLB-?(\\\\\\\\d+)/i)", "link.match(/MLB-?(\\\\d+)/i)");

// Let's just do a split and join to be safe
content = content.split("link.match(/MLB-?(\\\\d+)/i)").join("link.match(/MLB-?(\\\\d+)/i)");

fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
console.log('Regex fixed manually');
