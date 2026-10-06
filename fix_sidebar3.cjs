const fs = require('fs');
let sidebarContent = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

sidebarContent = sidebarContent.replace("import { LayoutDashboard", "import { Key, LayoutDashboard");

// Right after `const menuGroups = [`
// We will let the normal menuGroups define the base array, and then we filter it.
sidebarContent = sidebarContent.replace("const menuGroups = [", `
  const isPartner = user?.email === 'souza.abencoado4@gmail.com'
  const isAdmin = user?.email === 'willrandrier@gmail.com'

  let menuGroups = [
`);

// The previous file had `if (user?.email === 'willrandrier@gmail.com')`
sidebarContent = sidebarContent.replace("if (user?.email === 'willrandrier@gmail.com')", "if (isAdmin)");

// Now add the Sócio block and filter Gestão if needed, but I'll just remove Gestão and Digitaliza Comercial if isPartner.
// The user said: "Neste momento, NÃO adicionar ao painel do sócio: comissões, vendas, clientes, CRM..."
// So I will remove those groups from `menuGroups` for `isPartner`.
sidebarContent = sidebarContent.replace("menuGroups.push({", `
    if (isPartner) {
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
`);

sidebarContent = sidebarContent.replace("label: 'Digitaliza Comercial',", "label: 'Digitaliza Comercial',");

// Note: `menuGroups.push({ label: 'Digitaliza Comercial'` needs to be closed properly.
// The original code was:
/*
    menuGroups.push({
      label: 'Digitaliza Comercial',
      items: [
        { to: '/digitaliza-crm', icon: FileText, label: 'CRM Compartilhado', badge: 'PRO' },
      ]
    })
*/
// So `if (!isPartner) {` wraps that push. Let's do it carefully with regex.

