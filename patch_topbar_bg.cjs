const fs = require('fs');

let topbar = fs.readFileSync('src/components/layout/Topbar.tsx', 'utf8');

// Fix transparent bg
topbar = topbar.replace('bg-surface', 'bg-panel');

// Fix encodings
topbar = topbar.replace(/Notifica[^\x00-\x7F]+es/g, 'Notificações');
topbar = topbar.replace(/notifica[^\x00-\x7F]+o/g, 'notificação');

fs.writeFileSync('src/components/layout/Topbar.tsx', topbar, 'utf8');
console.log('Fixed Topbar bg and encodings');
