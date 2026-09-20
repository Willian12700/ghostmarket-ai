const fs = require('fs');
let file = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

file = file.replace(/Pre[^\x00-\x7F]+o/g, 'Preço');

fs.writeFileSync('src/pages/PromptBuilder.tsx', file, 'utf8');
console.log('Fixed encoding in PromptBuilder');
