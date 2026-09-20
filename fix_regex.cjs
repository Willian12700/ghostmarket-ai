const fs = require('fs');
let content = fs.readFileSync('src/pages/marketing/PlrGenerator.tsx', 'utf8');

content = content.split('.replace(/\\\\*\\\\*(.*?)\\\\*\\\\*/gim').join('.replace(/\\*\\*(.*?)\\*\\*/gim');
content = content.split('.replace(/\\\\*(.*?)\\\\*/gim').join('.replace(/\\*(.*?)\\*/gim');
content = content.split('.replace(/^\\\\s*-\\\\s+(.*$)/gim').join('.replace(/^\\s*-\\s+(.*$)/gim');
content = content.split('.replace(/\\\\n/g').join('.replace(/\\n/g');

fs.writeFileSync('src/pages/marketing/PlrGenerator.tsx', content, 'utf8');
console.log('Fixed');
