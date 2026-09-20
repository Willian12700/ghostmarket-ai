const fs = require('fs');
let content = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');

const importTarget = "Globe, Trash2, Edit, ExternalLink, Plus, Search, Eye, TrendingUp, Link2";
content = content.replace(importTarget, "Globe, Trash2, Edit, ExternalLink, Plus, Search, Eye, TrendingUp, Link2, BarChart");

content = content.replace(
  /<button onClick=\{\(\) => navigate\(`\/builder\?edit=\$\{site\.id\}`\)\} className="p-2 text-textSecondary hover:text-primary transition-colors bg-panel rounded-md border border-border" title="Editar.+?>/g,
  `<button onClick={() => {
                            const url = \`\${window.location.origin}/report/\${site.id}\`;
                            navigator.clipboard.writeText(url);
                            addToast('Link do relatório copiado!', 'success');
                            window.open(url, '_blank');
                          }} className="p-2 text-textSecondary hover:text-green-500 transition-colors bg-panel rounded-md border border-border" title="Gerar Relatório do Cliente">
                            <BarChart className="w-4 h-4" />
                          </button>
                          $&`
);

fs.writeFileSync('src/pages/HostedSites.tsx', content);
