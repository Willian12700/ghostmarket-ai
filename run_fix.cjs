const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

content = content.replace("import { LayoutDashboard", "import { Key, LayoutDashboard");

content = content.replace("const menuGroups = [", `
  const isPartner = user?.email === 'souza.abencoado4@gmail.com'
  const isAdmin = user?.email === 'willrandrier@gmail.com'

  let menuGroups = [
`);

content = content.replace(
  "if (user?.email === 'willrandrier@gmail.com') {",
  "if (isAdmin) {"
);

content = content.replace(
  "menuGroups.push({\n      label: 'Digitaliza Comercial',",
  `if (isPartner) {
      menuGroups = menuGroups.filter(g => g.label !== 'Gestǜo' && g.label !== 'Gestão');
      menuGroups.unshift({
        label: 'PAINEL SÓCIO',
        items: [
          { to: '/socio', icon: Key, label: 'Gerar Códigos VIP' }
        ]
      });
    }

    if (!isPartner) {
      menuGroups.push({
      label: 'Digitaliza Comercial',`
);

// Close the if (!isPartner) block. 
// The original code has:
//     menuGroups.push({
//       label: 'Digitaliza Comercial',
//       items: [
//         { to: '/digitaliza-crm', icon: FileText, label: 'CRM Compartilhado', badge: 'PRO' },
//       ]
//     })
// 
//     // Close sidebar on route change on mobile

content = content.replace(
  "    })\n  \n    // Close sidebar on route change on mobile",
  "    })\n    }\n  \n    // Close sidebar on route change on mobile"
);

content = content.replace(
  "user?.email === 'willrandrier@gmail.com' ? 'Administrador' : 'Membro Elite'",
  "isAdmin ? 'Administrador' : isPartner ? 'Sócio Ghost' : 'Membro Elite'"
);

fs.writeFileSync('src/components/layout/Sidebar.tsx', content, 'utf8');
