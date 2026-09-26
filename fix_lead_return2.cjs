const fs = require('fs');
let code = fs.readFileSync('src/pages/Scanner.tsx', 'utf8');

code = code.replace(/status: 'Novo'/g, "status: 'Novo',\n            imageUrl");

fs.writeFileSync('src/pages/Scanner.tsx', code, 'utf8');
