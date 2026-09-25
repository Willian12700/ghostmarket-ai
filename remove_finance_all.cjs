const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

const targetStr = `      {
        label: 'Financeiro e Pagamentos',
        items: [
          { to: '/finance', icon: Wallet, label: 'Meu Saldo' },
          { to: '/products', icon: Package, label: 'Meus Produtos' }
        ]
      },`;

content = content.replace(targetStr, '');

// Also remove from App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace("import { Finance } from '@/pages/Finance'\n", "");
appContent = appContent.replace("import { Products } from '@/pages/Products'\n", "");
appContent = appContent.replace("import { Checkout } from '@/pages/Checkout'\n", "");
appContent = appContent.replace('<Route path="/finance" element={<Finance />} />\n', '');
appContent = appContent.replace('<Route path="/products" element={<Products />} />\n', '');
appContent = appContent.replace('<Route path="/pay/:productId" element={<Checkout />} />\n', '');
fs.writeFileSync('src/App.tsx', appContent, 'utf8');

fs.writeFileSync('src/components/layout/Sidebar.tsx', content, 'utf8');
