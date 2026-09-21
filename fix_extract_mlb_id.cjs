const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

const oldFunc = `  const extractMlbId = (link: string) => {
    // Mercado Livre URLs often contain MLB123456789 or MLB-123456789
    const match = link.match(/MLB-?(\\d+)/i)
    if (match) return \`MLB\${match[1]}\`
    return null
  }`;

const newFunc = `  const extractMlbId = (link: string) => {
    // Check if it's a Catalog URL with an item_id parameter first
    const catalogMatch = link.match(/item_id:(MLB-?\\d+)/i);
    if (catalogMatch) {
      return catalogMatch[1].replace('-', '');
    }
    
    // Normal item URL
    const match = link.match(/MLB-?(\\d+)/i);
    if (match) return \`MLB\${match[1]}\`;
    return null;
  }`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
console.log('Fixed extractMlbId');
