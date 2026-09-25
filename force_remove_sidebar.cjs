const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// The exact string to remove:
const regex = /\s*\{\s*label:\s*'Financeiro e Pagamentos',\s*items:\s*\[\s*\{\s*to:\s*'\/finance',\s*icon:\s*Wallet,\s*label:\s*'Meu Saldo'\s*\},\s*\{\s*to:\s*'\/products',\s*icon:\s*Package,\s*label:\s*'Meus Produtos'\s*\}\s*\]\s*\},/g;

content = content.replace(regex, '');

fs.writeFileSync('src/components/layout/Sidebar.tsx', content, 'utf8');
