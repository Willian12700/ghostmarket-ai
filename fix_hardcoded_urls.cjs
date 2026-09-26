const fs = require('fs');

let code = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');
code = code.replace(/https:\/\/ghostmarket-ai\.vercel\.app/g, 'https://ghostmarket.cyou');
fs.writeFileSync('src/pages/HostedSites.tsx', code, 'utf8');

let intCode = fs.readFileSync('src/pages/Integrations.tsx', 'utf8');
intCode = intCode.replace(/https:\/\/ghostmarket-ai\.vercel\.app/g, 'https://ghostmarket.cyou');
fs.writeFileSync('src/pages/Integrations.tsx', intCode, 'utf8');
