const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Topbar.tsx', 'utf8');

content = content.replace("where('userId', '==', user.email)", "where('userId', '==', user.uid)");
content = content.replace("if (!user?.email) {", "if (!user?.uid) {");

fs.writeFileSync('src/components/layout/Topbar.tsx', content, 'utf8');
