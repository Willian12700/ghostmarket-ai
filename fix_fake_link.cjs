const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

content = content.replace(
  "permalink: 'https://www.mercadolivre.com.br/p/MLB19941168'",
  "permalink: 'https://produto.mercadolivre.com.br/MLB-2144883478-apple-airpods-pro-de-2-geraco-_JM'"
);

fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
