const fs = require('fs');
let code = fs.readFileSync('src/pages/Scanner.tsx', 'utf8');

code = code.replace(
  "typeof place.photos[0].getURI === 'function'",
  "typeof place.photos[0].getURI === 'function' || typeof place.photos[0].getUrl === 'function'"
);

code = code.replace(
  "imageUrl = place.photos[0].getURI({maxWidth: 600});",
  "imageUrl = place.photos[0].getURI ? place.photos[0].getURI({maxWidth: 600}) : place.photos[0].getUrl({maxWidth: 600});"
);

fs.writeFileSync('src/pages/Scanner.tsx', code, 'utf8');
