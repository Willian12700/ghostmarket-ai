const fs = require('fs');
let content = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');

// 1. Add toggle function
const toggleFn = `
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await updateDoc(doc(db, 'sites', id), { isActive: newStatus });
      setSites(sites.map(s => s.id === id ? { ...s, isActive: newStatus } : s));
      addToast(newStatus ? 'Site ativado com sucesso!' : 'Site desativado. Ninguém poderá acessá-lo.', 'success');
    } catch (e) {
      console.error(e);
      addToast('Erro ao alterar status do site', 'error');
    }
  }

  const handleDelete`;

content = content.replace('  const handleDelete', toggleFn);

// 2. Add PowerOff to lucide-react imports
if (!content.includes('Power,')) {
    content = content.replace('import { Globe, Plus', 'import { Globe, Plus, Power');
}

// 3. Add badge to the UI.
// Right after <div className="flex items-start justify-between mb-4">
const badge = `                      <div className="flex items-center gap-2 mt-2">
                        <div className={\`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border \${site.isActive !== false ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}\`}>
                          <span className={\`w-1.5 h-1.5 rounded-full \${site.isActive !== false ? 'bg-success animate-pulse' : 'bg-danger'}\`}></span>
                          {site.isActive !== false ? 'Site Ativado' : 'Site Desativado'}
                        </div>
                      </div>`;

const target1 = `<div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">`;

const replacement1 = `<div className="flex items-start justify-between mb-2">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">`;

content = content.replace(target1, replacement1);

// insert badge right after the views div.
const target2 = `                          <span className="text-xs font-bold text-white">{site.views || 0}</span>
                        </div>
                      </div>`;

const replacement2 = `                          <span className="text-xs font-bold text-white">{site.views || 0}</span>
                        </div>
                      </div>
${badge}
                      </div>`;

content = content.replace(target2, replacement2);

// 4. Add the Power button next to the Ver Relatório button
const target3 = `                      <div className="flex gap-2">`;
const replacement3 = `                      <div className="flex gap-2">
                        <button onClick={() => handleToggleStatus(site.id, site.isActive !== false)} className={\`p-2 bg-background border border-border rounded-lg transition-colors \${site.isActive !== false ? 'text-success hover:border-danger hover:text-danger' : 'text-danger hover:border-success hover:text-success'}\`} title={site.isActive !== false ? "Desativar Site" : "Ativar Site"}>
                          <Power className="w-4 h-4" />
                        </button>`;
content = content.replace(target3, replacement3);

fs.writeFileSync('src/pages/HostedSites.tsx', content, 'utf8');
