const fs = require('fs');

let topbar = fs.readFileSync('src/components/layout/Topbar.tsx', 'utf8');
topbar = topbar.replace(/notifica[^\x00-\x7F]+es/g, 'notificações');
topbar = topbar.replace(/notifica[^\x00-\x7F]+o/g, 'notificação');
fs.writeFileSync('src/components/layout/Topbar.tsx', topbar, 'utf8');

console.log("Fixed Topbar!");
