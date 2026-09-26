const fs = require('fs');

let pubCode = fs.readFileSync('src/pages/PublicPartners.tsx', 'utf8');
pubCode = pubCode.replace('R$ 64,99', 'R$ 45,15');
pubCode = pubCode.replace('Por cada venda deste plano (50%)</p>', 'Por cada venda deste plano (35%)</p>');
fs.writeFileSync('src/pages/PublicPartners.tsx', pubCode, 'utf8');

let affCode = fs.readFileSync('src/pages/Affiliates.tsx', 'utf8');
affCode = affCode.replace('R$ 64,99', 'R$ 45,15');
affCode = affCode.replace('Sua comissão (50%) a cada venda do Plano Vitalício.', 'Sua comissão (35%) a cada venda do Plano Vitalício.');
fs.writeFileSync('src/pages/Affiliates.tsx', affCode, 'utf8');
