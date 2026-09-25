const fs = require('fs');
let content = fs.readFileSync('src/pages/Products.tsx', 'utf8');

content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync('src/pages/Products.tsx', content, 'utf8');
