const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes("import { Products }")) {
  content = content.replace(
    "import { Finance } from '@/pages/Finance'",
    "import { Finance } from '@/pages/Finance'\nimport { Products } from '@/pages/Products'"
  );
}

if (!content.includes('<Route path="/products"')) {
  content = content.replace(
    '<Route path="/finance" element={<Finance />} />',
    '<Route path="/finance" element={<Finance />} />\n              <Route path="/products" element={<Products />} />'
  );
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
