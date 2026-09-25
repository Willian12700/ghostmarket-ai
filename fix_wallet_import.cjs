const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

if (!content.includes('Wallet,')) {
    content = content.replace("import { LayoutDashboard, Users, User, FileText, Settings, Ghost, AlertOctagon, ", "import { LayoutDashboard, Users, User, FileText, Settings, Ghost, AlertOctagon, Wallet, ");
    // Or if the last script failed to replace:
    content = content.replace("import { LayoutDashboard, Users, User, FileText, Settings, Ghost, AlertOctagon }", "import { LayoutDashboard, Users, User, FileText, Settings, Ghost, AlertOctagon, Wallet }");
}

fs.writeFileSync('src/components/layout/Sidebar.tsx', content, 'utf8');
