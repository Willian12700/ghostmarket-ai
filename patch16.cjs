const fs = require('fs');
let c = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');
c = c.replace(/sandbox="allow-scripts allow-same-origin"/g, 'sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"');
fs.writeFileSync('src/pages/SiteBuilder.tsx', c);
