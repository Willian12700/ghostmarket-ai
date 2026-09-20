const fs = require('fs');
['src/pages/tiktok/AdCopy.tsx', 'src/pages/tiktok/PersonaGenerator.tsx', 'src/pages/tiktok/ViralScripts.tsx'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/\\\`/g, '\`');
  c = c.replace(/\\\$/g, '$');
  fs.writeFileSync(f, c);
});
