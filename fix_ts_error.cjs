const fs = require('fs');

let admin = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

admin = admin.replace(', updateDoc', '');

fs.writeFileSync('src/pages/AdminPanel.tsx', admin, 'utf8');
console.log('Fixed TS Error');
