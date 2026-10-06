const fs = require('fs');
let content = fs.readFileSync('src/pages/PartnerPanel.tsx', 'utf8');

content = content.replace(/user\.name \|\| 'S[^']+'/g, "user.name || 'Sócio'");
content = content.replace(/status: 'Dispon[^']+' \| 'Em uso' \| 'Expirado'/g, "status: 'Disponível' | 'Em uso' | 'Expirado'");
content = content.replace(/status: 'Dispon[^']+' \| 'Em uso' \| 'Expirado' = 'Dispon[^']+';/g, "status: 'Disponível' | 'Em uso' | 'Expirado' = 'Disponível';");
content = content.replace(/status = 'Dispon[^']+';/g, "status = 'Disponível';");
content = content.replace(/<th className="px-6 py-4 font-medium">C[^<]+<\/th>/g, '<th className="px-6 py-4 font-medium">Código</th>');
content = content.replace(/<th className="px-6 py-4 font-medium">Dura[^<]+<\/th>/g, '<th className="px-6 py-4 font-medium">Duração</th>');
content = content.replace(/<th className="px-6 py-4 font-medium text-right">A[^<]+<\/th>/g, '<th className="px-6 py-4 font-medium text-right">Ação</th>');
content = content.replace(/Acesso Negado[^<]+<\/div>/g, "Acesso Negado. Esta área é restrita aos sócios.</div>");
content = content.replace(/Painel do S[^<]+<\/h1>/g, "Painel do Sócio</h1>");
content = content.replace(/Gerar Teste Gr[^<]+<\/CardTitle>/g, "Gerar Teste Grátis</CardTitle>");
content = content.replace(/Gere c[^<]+tempor[^<]+<\/p>/g, "Gere códigos de acesso VIP temporários</p>");
content = content.replace(/Dura[^<]+do Teste:/g, "Duração do Teste:");
content = content.replace(/Falha ao gerar c[^<]+/g, "Falha ao gerar código");
content = content.replace(/Copiado para a[^<]+transfer[^<]+/g, "Copiado para a área de transferência");
content = content.replace(/Falha ao copiar c[^<]+/g, "Falha ao copiar código");

fs.writeFileSync('src/pages/PartnerPanel.tsx', content, 'utf8');
