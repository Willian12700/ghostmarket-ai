const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');
code = code.replace(/<SalesNotifier \/>\\n\s*\{user\?\.isAnonymous && <TrialTimer \/>\}\\n\s*<\/div>/g, 
  "<SalesNotifier />\n      {user?.isAnonymous && <TrialTimer />}\n    </div>");
fs.writeFileSync('src/layouts/MainLayout.tsx', code, 'utf8');
