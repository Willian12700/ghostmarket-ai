const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

content = content.replace(", Wallet", "");
content = content.replace(", Package", "");
content = content.replace("Wallet, ", "");
content = content.replace("Package, ", "");

fs.writeFileSync('src/components/layout/Sidebar.tsx', content, 'utf8');
