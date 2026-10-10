const fs = require('fs');
let lines = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8').split('\n');
for (let i=0; i<lines.length; i++) {
  if (lines[i].includes('<th className="px-6 py-4">Usu')) lines[i] = '                  <th className="px-6 py-4">Usuário</th>';
  if (lines[i].includes('Acesso</th>')) lines[i] = '                  <th className="px-6 py-4">Último Acesso</th>';
  if (lines[i].includes('<th className="px-6 py-4 text-right">A')) lines[i] = '                  <th className="px-6 py-4 text-right">Ação</th>';
}
fs.writeFileSync('src/pages/AdminPanel.tsx', lines.join('\n'), 'utf8');
