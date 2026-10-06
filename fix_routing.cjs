const fs = require('fs');

// App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
if (!appContent.includes('PartnerPanel')) {
  appContent = appContent.replace("import { Demo } from '@/pages/Demo'", "import { Demo } from '@/pages/Demo'\nimport { PartnerPanel } from '@/pages/PartnerPanel'");
  appContent = appContent.replace('<Route path="/admin" element={<AdminPanel />} />', '<Route path="/admin" element={<AdminPanel />} />\n              <Route path="/socio" element={<PartnerPanel />} />');
  fs.writeFileSync('src/App.tsx', appContent, 'utf8');
}

// Sidebar.tsx
let sidebarContent = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
if (!sidebarContent.includes('souza.abencoado4@gmail.com')) {
  // Replace the menuGroups assignment to support socio
  sidebarContent = sidebarContent.replace('const menuGroups = [', `
  const isPartner = user?.email === 'souza.abencoado4@gmail.com'
  const isAdmin = user?.email === 'willrandrier@gmail.com'

  const menuGroups = isPartner ? [
    {
      label: 'PAINEL SÓCIO',
      items: [
        { to: '/socio', icon: Key, label: 'Gerar Códigos VIP' }
      ]
    }
  ] : [`);
  
  // Also we need to import Key in Sidebar.tsx if not imported
  if (!sidebarContent.includes('Key')) {
    sidebarContent = sidebarContent.replace('ShieldAlert,', 'ShieldAlert, Key,');
  }

  // Update isAdmin check
  sidebarContent = sidebarContent.replace("if (user?.email === 'willrandrier@gmail.com')", "if (isAdmin)");
  
  sidebarContent = sidebarContent.replace("user?.email === 'willrandrier@gmail.com' ? 'Administrador' : 'Membro Elite'", "isAdmin ? 'Administrador' : isPartner ? 'Sócio Ghost' : 'Membro Elite'");
  
  fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebarContent, 'utf8');
}
