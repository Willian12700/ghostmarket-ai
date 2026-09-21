const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

// Use regex to avoid encoding issues
content = content.replace(/addToast\('Link inv.+?, 'error'\)/, "addToast('ERRO EXTRAÇÃO: ' + url, 'error')");

fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
