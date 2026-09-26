const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
if (!code.includes('PublicPartners')) {
  code = code.replace("import { Landing } from '@/pages/Landing'", "import { Landing } from '@/pages/Landing'\nimport { PublicPartners } from '@/pages/PublicPartners'");
}

// Add Route
if (!code.includes('path="/parceiros"')) {
  code = code.replace('<Route path="/" element={<Landing />} />', '<Route path="/" element={<Landing />} />\n            <Route path="/parceiros" element={<PublicPartners />} />\n            <Route path="/socios" element={<PublicPartners />} />');
}

fs.writeFileSync('src/App.tsx', code, 'utf8');
