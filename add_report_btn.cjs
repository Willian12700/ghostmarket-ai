const fs = require('fs');
let content = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');

const importTarget = "Globe, Trash2, Edit, ExternalLink, Plus, Search, Eye, TrendingUp, Link2";
content = content.replace(importTarget, "Globe, Trash2, Edit, ExternalLink, Plus, Search, Eye, TrendingUp, Link2, BarChart");

const buttonTarget = `                        <div className="flex gap-2">
                          <button onClick={() => navigate(\`/builder?edit=\${site.id}\`)} className="p-2 text-textSecondary hover:text-primary transition-colors bg-panel rounded-md border border-border" title="Editar Código">
                            <Edit className="w-4 h-4" />
                          </button>`;

const newButtons = `                        <div className="flex gap-2">
                          <button onClick={() => {
                            const url = \`\${window.location.origin}/report/\${site.id}\`;
                            navigator.clipboard.writeText(url);
                            addToast('Link do relatório copiado!', 'success');
                            window.open(url, '_blank');
                          }} className="p-2 text-textSecondary hover:text-green-500 transition-colors bg-panel rounded-md border border-border" title="Gerar Relatório do Cliente">
                            <BarChart className="w-4 h-4" />
                          </button>
                          <button onClick={() => navigate(\`/builder?edit=\${site.id}\`)} className="p-2 text-textSecondary hover:text-primary transition-colors bg-panel rounded-md border border-border" title="Editar Código">
                            <Edit className="w-4 h-4" />
                          </button>`;

content = content.replace(buttonTarget, newButtons);
fs.writeFileSync('src/pages/HostedSites.tsx', content);
