const fs = require('fs');

let admin = fs.readFileSync('src/components/admin/NicheManager.tsx', 'utf8');
admin = admin.replace('getDoc, ', '');
fs.writeFileSync('src/components/admin/NicheManager.tsx', admin, 'utf8');

let prompt = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');
prompt = prompt.replace('MonitorSmartphone, ', '');
fs.writeFileSync('src/pages/PromptBuilder.tsx', prompt, 'utf8');

console.log('Fixed TS errors');
