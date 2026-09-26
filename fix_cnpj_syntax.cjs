const fs = require('fs');

let code = fs.readFileSync('src/pages/CnpjScanner.tsx', 'utf8');

// The literal file currently has {\`w-2 h-2 rounded-full \${result.descricao_situacao_cadastral === 'ATIVA' ? 'bg-success' : 'bg-error'}\`}
// Which means it literally has backslashes.

code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');

fs.writeFileSync('src/pages/CnpjScanner.tsx', code, 'utf8');
