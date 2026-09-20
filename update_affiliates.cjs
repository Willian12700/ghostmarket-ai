const fs = require('fs');
let content = fs.readFileSync('src/pages/Affiliates.tsx', 'utf8');

content = content.replace(
  'R$ 19,00',
  'R$ 64,99'
);

content = content.replace(
  'Por cada venda aprovada (13% de comissão).',
  'Por cada venda do Plano Vitalício (50% de comissão).'
);

content = content.replace(
  'R$ 19,00',
  'R$ 14,99'
);

content = content.replace(
  'Por cada venda aprovada (Comissão Fixa).',
  'Por cada venda do Plano Mensal (50% de comissão).'
);

fs.writeFileSync('src/pages/Affiliates.tsx', content, 'utf8');
console.log('Done affiliates');
