const fs = require('fs');

let file = fs.readFileSync('src/pages/Ranking.tsx', 'utf8');

file = file.replace(/\\\`/g, '\`');

fs.writeFileSync('src/pages/Ranking.tsx', file, 'utf8');
console.log('Fixed backticks');
