const fs = require('fs');

const files = [
  'src/pages/Creator.tsx',
  'src/pages/marketing/AdsGenerator.tsx',
  'src/pages/tiktok/PersonaGenerator.tsx',
  'src/pages/tiktok/ViralScripts.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\\`/g, '`');
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(file, content, 'utf8');
});
