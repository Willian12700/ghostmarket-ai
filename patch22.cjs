const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');
c = c.replace(
  "import { SiteBuilder } from '@/pages/SiteBuilder'", 
  "import { SiteBuilder } from '@/pages/SiteBuilder'\nimport { HostedSites } from '@/pages/HostedSites'"
);
c = c.replace(
  '<Route path="/builder" element={<SiteBuilder />} />', 
  '<Route path="/builder" element={<SiteBuilder />} />\n              <Route path="/sites" element={<HostedSites />} />'
);
fs.writeFileSync('src/App.tsx', c);
