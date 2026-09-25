const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes("import { Checkout }")) {
  content = content.replace(
    "import { Products } from '@/pages/Products'",
    "import { Products } from '@/pages/Products'\nimport { Checkout } from '@/pages/Checkout'"
  );
}

if (!content.includes('<Route path="/pay/:productId"')) {
  // We need to add this route OUTSIDE of MainLayout if we want buyers to access it without logging in!
  // But wait, the standard routes are all inside MainLayout except Login/Register.
  
  const target = `<Route path="/login" element={<Login />} />`;
  const replacement = `<Route path="/login" element={<Login />} />
        <Route path="/pay/:productId" element={<Checkout />} />`;
        
  content = content.replace(target, replacement);
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
