const fs = require('fs');
let content = fs.readFileSync('src/components/admin/ActionLogs.tsx', 'utf8');

content = content.replace(/Registro de A.es \(S.cio\)/g, "Registro de Ações (Sócio)");
content = content.replace(/<th className="px-6 py-4 font-medium">S.cio<\/th>/g, '<th className="px-6 py-4 font-medium">Sócio</th>');
content = content.replace(/<th className="px-6 py-4 font-medium">A.o<\/th>/g, '<th className="px-6 py-4 font-medium">Ação</th>');
content = content.replace(/<th className="px-6 py-4 font-medium">C.digo<\/th>/g, '<th className="px-6 py-4 font-medium">Código</th>');
content = content.replace(/<th className="px-6 py-4 font-medium">Dura.o<\/th>/g, '<th className="px-6 py-4 font-medium">Duração</th>');
content = content.replace(/Dispon.vel/g, 'Disponível');
content = content.replace(/Dura.o/g, 'Duração');

fs.writeFileSync('src/components/admin/ActionLogs.tsx', content, 'utf8');
