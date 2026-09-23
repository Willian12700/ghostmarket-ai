const fs = require('fs');
let content = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');

// 1. Add Power to imports
if (!content.includes('Power')) {
    content = content.replace('Activity } from \'lucide-react\'', 'Activity, Power } from \'lucide-react\'');
}

// 2. Add isActive to type Site
if (!content.includes('isActive?: boolean')) {
    content = content.replace(
        'isRedirect?: boolean;',
        'isRedirect?: boolean;\n  isActive?: boolean;'
    );
}

// 3. Add handleToggleStatus function before handleDelete
const toggleFn = `
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await updateDoc(doc(db, 'sites', id), { isActive: newStatus });
      setSites(sites.map(s => s.id === id ? { ...s, isActive: newStatus } : s));
      addToast(newStatus ? 'Site ativado com sucesso!' : 'Site desativado.', 'success');
    } catch (e) {
      console.error(e);
      addToast('Erro ao alterar status do site', 'error');
    }
  }

  const handleDelete`;

if (!content.includes('handleToggleStatus')) {
    content = content.replace('  const handleDelete', toggleFn);
}

// 4. Update the card header to include the badge
const targetCardHeader = `<div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">`;

const badgeHtml = `
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">`;

if (content.includes(targetCardHeader)) {
    content = content.replace(targetCardHeader, badgeHtml);
}

// 5. Inject the badge after the views tag and close the new flex col
const targetViews = `                          <span className="text-xs font-bold text-white">{site.views || 0}</span>
                        </div>
                      </div>`;

const badgeInjection = `                          <span className="text-xs font-bold text-white">{site.views || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={\`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border \${site.isActive !== false ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}\`}>
                          <span className={\`w-1.5 h-1.5 rounded-full \${site.isActive !== false ? 'bg-success animate-pulse' : 'bg-danger'}\`}></span>
                          {site.isActive !== false ? 'Site Ativado' : 'Site Desativado'}
                        </div>
                      </div>
                    </div>`;

if (content.includes(targetViews)) {
    content = content.replace(targetViews, badgeInjection);
}

// 6. Inject the Power button before the Report button
const targetActions = `<div className="flex gap-2">
                        <button onClick={() => {`;

const buttonInjection = `<div className="flex gap-2">
                        <button onClick={() => handleToggleStatus(site.id, site.isActive !== false)} className={\`p-2 bg-background border border-border rounded-lg transition-colors \${site.isActive !== false ? 'text-success hover:border-danger hover:text-danger' : 'text-danger hover:border-success hover:text-success'}\`} title={site.isActive !== false ? "Desativar Site" : "Ativar Site"}>
                          <Power className="w-4 h-4" />
                        </button>
                        <button onClick={() => {`;

if (content.includes(targetActions)) {
    content = content.replace(targetActions, buttonInjection);
}

fs.writeFileSync('src/pages/HostedSites.tsx', content, 'utf8');
