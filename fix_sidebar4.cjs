const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

content = content.replace("  menuGroups.push({\n    label: 'Digitaliza Comercial',", `
  if (isPartner) {
      menuGroups = menuGroups.filter(g => g.label !== 'Gestǜo' && g.label !== 'Gestão' && g.label !== 'Digitaliza Comercial' && g.label !== 'PAINEL ADM');
      menuGroups.unshift({
          label: 'PAINEL SÓCIO',
          items: [
              { to: '/socio', icon: Key, label: 'Gerar Códigos VIP' }
          ]
      });
  } else {
      menuGroups.push({
          label: 'Digitaliza Comercial',
`);

content = content.replace("    ]\n  })\n\n  // Close", "    ]\n      })\n  }\n\n  // Close");

fs.writeFileSync('src/components/layout/Sidebar.tsx', content, 'utf8');
