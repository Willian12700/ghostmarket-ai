const fs = require('fs');
let content = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');

// Replace card header using regex
content = content.replace(
  /<div className="flex items-start justify-between mb-4">\s*<div className="flex items-center gap-3">/,
  `<div className="flex items-start justify-between mb-2">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">`
);

// Replace views
content = content.replace(
  /<span className="text-xs font-bold text-white">\{site\.views \|\| 0\}<\/span>\s*<\/div>\s*<\/div>/,
  `<span className="text-xs font-bold text-white">{site.views || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={\`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border \${site.isActive !== false ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}\`}>
                          <span className={\`w-1.5 h-1.5 rounded-full \${site.isActive !== false ? 'bg-success animate-pulse' : 'bg-danger'}\`}></span>
                          {site.isActive !== false ? 'Site Ativado' : 'Site Desativado'}
                        </div>
                      </div>
                    </div>`
);

// Replace actions
content = content.replace(
  /<div className="flex gap-2">\s*<button onClick=\{\(\) => \{/m,
  `<div className="flex gap-2">
                        <button onClick={() => handleToggleStatus(site.id, site.isActive !== false)} className={\`p-2 bg-background border border-border rounded-lg transition-colors \${site.isActive !== false ? 'text-success hover:border-danger hover:text-danger' : 'text-danger hover:border-success hover:text-success'}\`} title={site.isActive !== false ? "Desativar Site" : "Ativar Site"}>
                          <Power className="w-4 h-4" />
                        </button>
                        <button onClick={() => {`
);

fs.writeFileSync('src/pages/HostedSites.tsx', content, 'utf8');
