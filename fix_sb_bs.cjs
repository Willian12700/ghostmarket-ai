const fs = require('fs');
let content = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync('src/pages/SiteBuilder.tsx', content, 'utf8');
