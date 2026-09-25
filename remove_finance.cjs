const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// Find and remove the entire Financeiro e Pagamentos block
const regex = /\s*\{\s*label:\s*'Financeiro e Pagamentos'[\s\S]*?\}\s*\},/;
content = content.replace(regex, '');

fs.writeFileSync('src/components/layout/Sidebar.tsx', content, 'utf8');
