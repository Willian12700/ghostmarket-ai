const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// Add BellRing to imports if missing
if (!content.includes('BellRing')) {
    content = content.replace('LayoutDashboard', 'LayoutDashboard, BellRing');
}

const target = "label: 'Prompt, Sites e Leads',";
if (content.includes(target)) {
    const newGroup = `label: 'Inteligência de Mercado',
      items: [
        { to: '/offers', icon: BellRing, label: 'Tracker de Ofertas' }
      ]
    },
    {
      label: 'Prompt, Sites e Leads',`;
    
    content = content.replace(target, newGroup);
    fs.writeFileSync('src/components/layout/Sidebar.tsx', content, 'utf8');
    console.log('Sidebar.tsx updated');
} else {
    console.log('Target string not found');
}
