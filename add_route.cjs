const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

if (!app.includes('ClientReport')) {
  app = app.replace(
    "import { SiteViewer } from '@/pages/SiteViewer'",
    "import { SiteViewer } from '@/pages/SiteViewer'\nimport { ClientReport } from '@/pages/ClientReport'"
  );
  
  app = app.replace(
    "<Route path=\"/s/:siteId\" element={<SiteViewer />} />",
    "<Route path=\"/s/:siteId\" element={<SiteViewer />} />\n            <Route path=\"/report/:siteId\" element={<ClientReport />} />"
  );
  
  fs.writeFileSync('src/App.tsx', app);
}
