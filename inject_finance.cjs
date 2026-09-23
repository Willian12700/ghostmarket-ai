const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import { Finance }')) {
  content = content.replace(
    "import { HostedSites } from '@/pages/HostedSites'",
    "import { HostedSites } from '@/pages/HostedSites'\nimport { Finance } from '@/pages/Finance'"
  );
}

if (!content.includes('<Route path="/finance"')) {
  content = content.replace(
    '<Route path="/sites" element={<HostedSites />} />',
    '<Route path="/sites" element={<HostedSites />} />\n              <Route path="/finance" element={<Finance />} />'
  );
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
