const fs = require('fs');
let code = fs.readFileSync('generate_marketing_pages.cjs', 'utf8');
code = code.replace("fs.writeFileSync(\\`src/pages/marketing/\\${t.name}.tsx\\`, content, 'utf8');", "fs.writeFileSync('src/pages/marketing/' + t.name + '.tsx', content, 'utf8');");
fs.writeFileSync('generate_marketing_pages.cjs', code, 'utf8');
