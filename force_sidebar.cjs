const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

const target = `      {
        label: 'Organiza`;

const insert = `      {
        label: 'Financeiro e Pagamentos',
        items: [
          { to: '/finance', icon: Wallet, label: 'Meu Saldo' }
        ]
      },
`;

if (!content.includes('/finance')) {
  const index = content.indexOf(target);
  if (index !== -1) {
    content = content.substring(0, index) + insert + content.substring(index);
  }
}

if (!content.includes('Wallet,')) {
    content = content.replace("import { LayoutDashboard, Users, User, FileText, Settings, Ghost, AlertOctagon,", "import { LayoutDashboard, Users, User, FileText, Settings, Ghost, AlertOctagon, Wallet,");
}

fs.writeFileSync('src/components/layout/Sidebar.tsx', content, 'utf8');
