const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// Ensure Key is imported
if (!content.includes('Key,')) {
    content = content.replace("from 'lucide-react'", ", Key } from 'lucide-react'");
}

// Modify menuGroups array
content = content.replace("const menuGroups = [", `
  const isPartner = user?.email === 'souza.abencoado4@gmail.com';
  const isAdmin = user?.email === 'willrandrier@gmail.com';

  let menuGroups = [
`);

// Apply isAdmin logic
content = content.replace("if (user?.email === 'willrandrier@gmail.com')", "if (isAdmin)");

// Append filtering logic for Sócio and PAINEL SÓCIO
content = content.replace("    // Close sidebar on route change on mobile", `
    if (isPartner) {
        menuGroups = menuGroups.filter(g => g.label !== 'Gestǜo' && g.label !== 'Gestão' && g.label !== 'Digitaliza Comercial' && g.label !== 'PAINEL ADM');
        menuGroups.unshift({
            label: 'PAINEL SÓCIO',
            items: [
                { to: '/socio', icon: Key, label: 'Gerar Códigos VIP' }
            ]
        });
    }

    // Close sidebar on route change on mobile
`);

content = content.replace(
  "user?.email === 'willrandrier@gmail.com' ? 'Administrador' : 'Membro Elite'",
  "isAdmin ? 'Administrador' : isPartner ? 'Sócio Ghost' : 'Membro Elite'"
);

fs.writeFileSync('src/components/layout/Sidebar.tsx', content, 'utf8');
