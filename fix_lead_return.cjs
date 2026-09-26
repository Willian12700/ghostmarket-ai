const fs = require('fs');
let code = fs.readFileSync('src/pages/Scanner.tsx', 'utf8');

code = code.replace(
  "userRatingsTotal: place.userRatingCount || 0,\n            status: 'Novo'",
  "userRatingsTotal: place.userRatingCount || 0,\n            status: 'Novo',\n            imageUrl"
);

fs.writeFileSync('src/pages/Scanner.tsx', code, 'utf8');
