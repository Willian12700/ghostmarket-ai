const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

// Change Mercado Livre references to Shopee
content = content.replace(/Mercado Livre/g, 'Shopee');
content = content.replace(/mercadolivre\.com\.br/g, 'shopee.com.br');

// Change warning message for Shopee
content = content.replace(/A Shopee limitou o acesso/g, 'A Shopee limitou o acesso anônimo');

// Update UI Badge color (yellow-500 -> orange-500)
content = content.replace(/text-yellow-500/g, 'text-orange-500');

// Update the placeholder
content = content.replace('Cole o link do produto aqui (Ex: Shopee)...', 'Cole o link do produto aqui (Ex: https://shopee.com.br/...)');

// Change the simulation button data to a Shopee product
const oldSimData = `mlbId: 'MLB' + randomId,
                  title: 'Apple AirPods Pro (2ª Geração) - Simulação',
                  price: 1899.00,
                  originalPrice: 2599.00,
                  image: 'https://http2.mlstatic.com/D_NQ_NP_2X_910793-MLA51475711656_092022-F.webp',
                  permalink: 'https://produto.shopee.com.br/MLB-2144883478-apple-airpods-pro-de-2-geraco-_JM',
                  platform: 'Shopee'`;

const newSimData = `mlbId: 'SHP' + randomId,
                  title: 'Fone Bluetooth Lenovo GM2 Pro - Baixo Atraso e Microfone',
                  price: 45.90,
                  originalPrice: 99.90,
                  image: 'https://down-br.img.susercontent.com/file/br-11134207-7qukw-ljbtyj2y3r6j7f',
                  permalink: 'https://shopee.com.br/Fone-Bluetooth-Lenovo-GM2-Pro-i.123456.789012',
                  platform: 'Shopee'`;

content = content.replace(oldSimData, newSimData);

// Fix the ID extraction so it doesn't break if they paste a real Shopee link.
// Shopee links typically have 'i.SHOPID.ITEMID' at the end.
const oldExtract = `  const extractMlbId = (link: string) => {
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

const newExtract = `  const extractMlbId = (link: string) => {
    // Extract Shopee ID (e.g. i.12345.67890)
    const match = link.match(/i\\.(\\d+\\.\\d+)/i);
    if (match) return \`SHP-\${match[1]}\`;
    
    // For shortlinks or generic cases, just create a mock hash
    if (link.includes('shopee') || link.includes('shp.ee')) {
      return 'SHP-' + Math.floor(Math.random() * 1000000);
    }
    return null;
  }`;

content = content.replace(oldExtract, newExtract);

// Update error message for extraction
content = content.replace(/ERRO EXTRAÇÃO: /g, 'Link Inválido: Insira um link válido da Shopee ');

fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
console.log('Migrated to Shopee');
