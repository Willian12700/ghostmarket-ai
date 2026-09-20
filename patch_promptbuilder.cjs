const fs = require('fs');

let prompt = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');
prompt = prompt.replace('className="grid grid-cols-2 gap-3"', 'className="grid grid-cols-1 sm:grid-cols-2 gap-3"');
prompt = prompt.replace('className="grid grid-cols-2 gap-4"', 'className="grid grid-cols-1 sm:grid-cols-2 gap-4"');
fs.writeFileSync('src/pages/PromptBuilder.tsx', prompt, 'utf8');

console.log('PromptBuilder mobile patched');
