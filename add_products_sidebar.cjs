const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

if (!content.includes("{ to: '/products'")) {
    content = content.replace(
        "{ to: '/finance', icon: Wallet, label: 'Meu Saldo' }",
        "{ to: '/finance', icon: Wallet, label: 'Meu Saldo' },\n          { to: '/products', icon: Package, label: 'Meus Produtos' }"
    );
}

if (!content.includes('Package,')) {
    content = content.replace(
        "import { LayoutDashboard",
        "import { LayoutDashboard, Package"
    );
}

fs.writeFileSync('src/components/layout/Sidebar.tsx', content, 'utf8');
