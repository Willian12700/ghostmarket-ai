const fs = require('fs');
let lines = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8').split('\n');
let newLines = [];

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (line.includes('if (isAdmin) {')) {
        newLines.push("  if (isPartner) {");
        newLines.push("      menuGroups = menuGroups.filter(g => !['Gestǜo', 'Gestão', 'Digitaliza Comercial', 'PAINEL ADM'].includes(g.label));");
        newLines.push("      menuGroups.unshift({");
        newLines.push("          label: 'PAINEL SÓCIO',");
        newLines.push("          items: [");
        newLines.push("              { to: '/socio', icon: Key, label: 'Gerar Códigos VIP' }");
        newLines.push("          ]");
        newLines.push("      });");
        newLines.push("  }");
        newLines.push("");
    }

    newLines.push(line);
}

fs.writeFileSync('src/components/layout/Sidebar.tsx', newLines.join('\n'), 'utf8');
