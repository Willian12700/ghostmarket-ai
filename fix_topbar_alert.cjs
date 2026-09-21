const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Topbar.tsx', 'utf8');

content = content.replace(/console\.error\("Erro ao buscar.+?\)/, 'console.error("Erro", error); alert("Firebase bloqueou o Sininho! Motivo: " + error.message)');

fs.writeFileSync('src/components/layout/Topbar.tsx', content, 'utf8');
