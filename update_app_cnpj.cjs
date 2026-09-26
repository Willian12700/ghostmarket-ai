const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Import the new page
if (!code.includes('CnpjScanner')) {
  code = code.replace(
    "import { Scanner } from '@/pages/Scanner'",
    "import { Scanner } from '@/pages/Scanner'\nimport { CnpjScanner } from '@/pages/CnpjScanner'"
  );

  // Add the route inside MainLayout
  code = code.replace(
    "<Route path=\"/scanner\" element={<Scanner />} />",
    "<Route path=\"/scanner\" element={<Scanner />} />\n              <Route path=\"/cnpj\" element={<CnpjScanner />} />"
  );

  fs.writeFileSync('src/App.tsx', code, 'utf8');
}
