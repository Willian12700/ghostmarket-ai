const fs = require('fs');
let code = fs.readFileSync('src/pages/Scanner.tsx', 'utf8');

code = code.replace(
  "status: 'Novo',\n            imageUrl | 'Contatado'",
  "status: 'Novo' | 'Contatado'"
);

fs.writeFileSync('src/pages/Scanner.tsx', code, 'utf8');
