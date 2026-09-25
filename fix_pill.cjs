const fs = require('fs');
let content = fs.readFileSync('src/components/ui/PillSelector.tsx', 'utf8');
content = content.replace(/\\\$/g, '$');
content = content.replace(/\\`/g, '`');
fs.writeFileSync('src/components/ui/PillSelector.tsx', content);
