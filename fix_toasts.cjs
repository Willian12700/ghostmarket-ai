const fs = require('fs');
let content = fs.readFileSync('src/pages/PartnerPanel.tsx', 'utf8');

content = content.replace(/addToast\([\s\S]*?gerado com sucesso!', 'success'\);/, "addToast(`Código gerado com sucesso!`, 'success');");
content = content.replace(/addToast\('Erro ao gerar[^']*', 'error'\);/, "addToast('Erro ao gerar código', 'error');");
content = content.replace(/addToast\('[^']*copiado!', 'success'\);/, "addToast('Código copiado!', 'success');");

fs.writeFileSync('src/pages/PartnerPanel.tsx', content, 'utf8');
