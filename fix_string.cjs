const fs = require('fs');
let code = fs.readFileSync('src/pages/SalesScripts.tsx', 'utf8');

// Replace the multiline string with a backtick string
code = code.replace(/text: "Basicamente[\s\S]*?cyou\/demo"/, 'text: `Basicamente eu criei uma mquina, o GhostMarket AI. Ela cria pginas de vendas absurdas e profissionais em 20 segundos usando Inteligncia Artificial, hospeda de graa no seu domnio e ainda varre o Google Maps atrs de clientes pra voc vender esses sites por R$500 a R$1000. \\n\\nD uma olhada na Demo: https://ghostmarket.cyou/demo`');

fs.writeFileSync('src/pages/SalesScripts.tsx', code, 'utf8');
