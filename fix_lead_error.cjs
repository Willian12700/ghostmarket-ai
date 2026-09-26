const fs = require('fs');
let code = fs.readFileSync('src/pages/Scanner.tsx', 'utf8');

code = code.replace(
  "status: 'Novo',\n            imageUrl }]);",
  "status: 'Novo',\n            imageUrl: undefined }]);"
);

fs.writeFileSync('src/pages/Scanner.tsx', code, 'utf8');
