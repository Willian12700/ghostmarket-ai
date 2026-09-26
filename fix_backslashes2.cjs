const fs = require('fs');

const files = [
  'src/pages/marketing/EmailFunnel.tsx',
  'src/pages/marketing/PlrGenerator.tsx',
  'src/pages/marketing/VslGenerator.tsx',
  'src/pages/tiktok/AdCopy.tsx',
  'src/pages/Chatbots.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\\`/g, '`');
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(file, content, 'utf8');
});
