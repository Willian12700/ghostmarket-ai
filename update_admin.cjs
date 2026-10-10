const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

content = content.replace(
  /<th className="px-6 py-4">Último Acesso<\/th>\s*<th className="px-6 py-4 text-right">Ação<\/th>/g,
  '<th className="px-6 py-4">Último Acesso</th>\n                    <th className="px-6 py-4">Origem</th>\n                    <th className="px-6 py-4 text-right">Ação</th>'
);

content = content.replace(
  /<td className="px-6 py-4 whitespace-nowrap">\s*<span className="text-textSecondary text-xs">\s*\{u\.lastLogin \? new Date\(u\.lastLogin\)\.toLocaleDateString\(\) : 'Nunca'\}\s*<\/span>\s*<\/td>\s*<td className="px-6 py-4 text-right">/g,
  '<td className="px-6 py-4 whitespace-nowrap">\n                            <span className="text-textSecondary text-xs">\n                              {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : \'Nunca\'}\n                            </span>\n                          </td>\n                          <td className="px-6 py-4 whitespace-nowrap">\n                            <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs text-textSecondary">\n                              {u.utm_source ? u.utm_source : \'Orgânico/Direto\'}\n                            </span>\n                          </td>\n                          <td className="px-6 py-4 text-right">'
);

fs.writeFileSync('src/pages/AdminPanel.tsx', content, 'utf8');
