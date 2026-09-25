const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// Use regex to insert before the block that contains '/contracts'
const regex = /(\{\s*label:\s*'.*?',\s*items:\s*\[\s*\{\s*to:\s*'\/contracts'.*?\n\s*\]\s*\})/g;

if (!content.includes('/finance')) {
    content = content.replace(regex, `    {
      label: 'Financeiro e Pagamentos',
      items: [
        { to: '/finance', icon: Wallet, label: 'Meu Saldo' }
      ]
    },
    $1`);
}

if (!content.includes('Wallet,')) {
    content = content.replace("import { LayoutDashboard, Users, User, FileText, Settings, Ghost, AlertOctagon,", "import { LayoutDashboard, Users, User, FileText, Settings, Ghost, AlertOctagon, Wallet,");
}

fs.writeFileSync('src/components/layout/Sidebar.tsx', content, 'utf8');
