const fs = require('fs');
let content = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');

content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync('src/pages/Checkout.tsx', content, 'utf8');
