const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');
content = content.replace(/sltimo Acesso/g, 'Último Acesso');
content = content.replace(/Ao/g, 'Ação');
fs.writeFileSync('src/pages/AdminPanel.tsx', content, 'utf8');
