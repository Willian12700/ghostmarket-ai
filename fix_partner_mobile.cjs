const fs = require('fs');

let content = fs.readFileSync('src/pages/PartnerPanel.tsx', 'utf8');

// Fix padding and button layout
content = content.replace('className="p-8 max-w-5xl mx-auto space-y-8 w-full"', 'className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-8 w-full"');
content = content.replace('className="flex gap-4"', 'className="flex flex-col sm:flex-row gap-3 md:gap-4"');

// Fix encoding issues caused by previous Powershell writes
content = content.replace(/Scio/g, 'Sócio');
content = content.replace(/Disponvel/g, 'Disponível');
content = content.replace(/Cdigo/g, 'Código');
content = content.replace(/Durao/g, 'Duração');
content = content.replace(/Ao/g, 'Ação');
content = content.replace(/Esta rea  restrita aos scios/g, 'Esta área é restrita aos sócios');
content = content.replace(/Gerar Teste Grtis/g, 'Gerar Teste Grátis');
content = content.replace(/temporrios/g, 'temporários');
content = content.replace(/Gere cdigos de acesso/g, 'Gere códigos de acesso');
content = content.replace(/sucesso/g, 'sucesso'); // just in case
content = content.replace(/Copiado para a rea de transferncia/g, 'Copiado para a área de transferência');
content = content.replace(/Falha ao copiar cdigo/g, 'Falha ao copiar código');

fs.writeFileSync('src/pages/PartnerPanel.tsx', content, 'utf8');

