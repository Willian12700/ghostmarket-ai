const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

const anchor = "{ to: '/contracts',";

if (!content.includes('/finance') && content.includes(anchor)) {
    // We want to insert the new block BEFORE the block that contains contracts.
    // Let's just find the `label:` string right before the anchor.
    const beforeAnchor = content.substring(0, content.indexOf(anchor));
    const lastLabelIndex = beforeAnchor.lastIndexOf('{');
    
    const insert = `{
        label: 'Financeiro e Pagamentos',
        items: [
          { to: '/finance', icon: Wallet, label: 'Meu Saldo' }
        ]
      },
      `;
      
    content = content.substring(0, lastLabelIndex) + insert + content.substring(lastLabelIndex);
}

if (!content.includes('Wallet,')) {
    content = content.replace("import { LayoutDashboard, Users, User, FileText, Settings, Ghost, AlertOctagon,", "import { LayoutDashboard, Users, User, FileText, Settings, Ghost, AlertOctagon, Wallet,");
}

fs.writeFileSync('src/components/layout/Sidebar.tsx', content, 'utf8');
