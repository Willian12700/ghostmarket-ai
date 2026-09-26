const fs = require('fs');

let code = fs.readFileSync('src/pages/Scanner.tsx', 'utf8');

const originalLink = "href={`https://www.google.com/search?q=${encodeURIComponent(xrayLead.name + ' ' + xrayLead.city + ' cnpj')}`} target=\"_blank\" rel=\"noopener noreferrer\" className=\"flex items-center gap-2 p-3 bg-[#0b0714] border border-[#261f36] hover:border-primary/50 hover:bg-primary/5 transition-all rounded-lg text-sm text-gray-300\"";

const newLink = `href={\`https://www.google.com/search?q=\${encodeURIComponent(xrayLead.name + ' ' + xrayLead.city + ' cnpj')}\`} 
                        onClick={() => {
                          navigator.clipboard.writeText(xrayLead.name + ' ' + xrayLead.city);
                          alert('O nome do estabelecimento foi copiado! \\n\\nComo o Google Maps esconde o CNPJ por segurança, você será levado ao Google. Copie o CNPJ de lá e use a aba "Dossiê CNPJ" aqui no sistema!');
                        }}
                        target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-[#0b0714] border border-[#261f36] hover:border-primary/50 hover:bg-primary/5 transition-all rounded-lg text-sm text-gray-300"`;

code = code.replace(originalLink, newLink);

fs.writeFileSync('src/pages/Scanner.tsx', code, 'utf8');
