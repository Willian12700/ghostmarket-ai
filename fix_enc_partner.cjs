const fs = require('fs');
let content = fs.readFileSync('src/pages/PartnerPanel.tsx', 'utf8');

content = content.replace(/\uFFFD/g, ''); // wait, replacing that is tricky. Let's do it based on surrounding characters.

content = content.replace(/S.cio/g, 'Sócio');
content = content.replace(/Dispon.vel/g, 'Disponível');
content = content.replace(/C.digo/g, 'Código');
content = content.replace(/Dura.o/g, 'Duração');
content = content.replace(/A.o/g, 'Ação');
content = content.replace(/Esta .rea . restrita aos s.cios/g, 'Esta área é restrita aos sócios');
content = content.replace(/Gerar Teste Gr.tis/g, 'Gerar Teste Grátis');
content = content.replace(/tempor.rios/g, 'temporários');
content = content.replace(/Gere c.digos de acesso/g, 'Gere códigos de acesso');
content = content.replace(/Copiado para a .rea de transfer.ncia/g, 'Copiado para a área de transferência');
content = content.replace(/Falha ao copiar c.digo/g, 'Falha ao copiar código');

fs.writeFileSync('src/pages/PartnerPanel.tsx', content, 'utf8');
