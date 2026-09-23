const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

if (!content.includes("label: 'Financeiro e Pagamentos'")) {
  const target = `    {
      label: 'Organização',`;
  const replacement = `    {
      label: 'Financeiro e Pagamentos',
      items: [
        { to: '/finance', icon: Wallet, label: 'Meu Saldo' },
      ]
    },
    {
      label: 'Organização',`;
      
  content = content.replace(target, replacement);
  
  if (!content.includes('Wallet,')) {
    content = content.replace("import { LayoutDashboard, Users, User, FileText, Settings, Ghost, AlertOctagon,", "import { LayoutDashboard, Users, User, FileText, Settings, Ghost, AlertOctagon, Wallet,");
  }

  fs.writeFileSync('src/components/layout/Sidebar.tsx', content, 'utf8');
}
