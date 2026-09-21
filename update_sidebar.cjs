const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// Add BellRing to imports if missing
if (!content.includes('BellRing')) {
    content = content.replace('LayoutDashboard', 'LayoutDashboard, BellRing');
}

const newGroup = `{
      label: 'Inteligência de Mercado',
      items: [
        { to: '/offers', icon: BellRing, label: 'Inteligência de Ofertas' }
      ]
    },
    {
      label: 'Prompt, Sites e Leads',`;

content = content.replace("{\\n      label: 'Prompt, Sites e Leads',", newGroup);

fs.writeFileSync('src/components/layout/Sidebar.tsx', content, 'utf8');
console.log('Sidebar.tsx updated');
