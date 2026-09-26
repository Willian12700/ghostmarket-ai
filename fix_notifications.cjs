const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Topbar.tsx', 'utf8');

code = code.replace(
  /where\('userId',\s*'==',\s*user\.uid\)/,
  "where('userId', 'in', [user.uid, user.email])"
);

fs.writeFileSync('src/components/layout/Topbar.tsx', code, 'utf8');
