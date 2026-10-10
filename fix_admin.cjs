const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');
c = c.replace(/Usu\ufffdrío/g, 'Usuário');
c = c.replace(/Usu.rio/g, 'Usuário');
c = c.replace(/.sltimo Acesso/g, 'Último Acesso');
c = c.replace(/A.o<\/th>/g, 'Ação</th>');
fs.writeFileSync('src/pages/AdminPanel.tsx', c, 'utf8');
