const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

const target = "onClick={() => window.location.href = 'mailto:suporte@ghostmarket.ai'}";
const replacement = "onClick={() => window.open('https://wa.me/5584996162332?text=Olá,%20minha%20conta%20na%20GhostMarket%20foi%20suspensa%20e%20gostaria%20de%20ajuda.', '_blank')}";

content = content.replace(target, replacement);

fs.writeFileSync('src/layouts/MainLayout.tsx', content, 'utf8');
