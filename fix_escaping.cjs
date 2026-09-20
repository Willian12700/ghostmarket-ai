const fs = require('fs');
let content = fs.readFileSync('src/pages/ClientReport.tsx', 'utf8');
content = content.replace("animate={{ height: \\`\\${Math.max(15, height)}%\\` }}", "animate={{ height: `${Math.max(15, height)}%` }}");
fs.writeFileSync('src/pages/ClientReport.tsx', content);
