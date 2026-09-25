const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("import { Checkout } from '@/pages/Checkout'\n", "");
content = content.replace("import { Finance } from '@/pages/Finance'\n", "");
content = content.replace("import { Products } from '@/pages/Products'\n", "");

const payRoute = `<Route path="/login" element={<Login />} />
        <Route path="/pay/:productId" element={<Checkout />} />`;
content = content.replace(payRoute, `<Route path="/login" element={<Login />} />`);

content = content.replace(/<Route path="\/finance" element=\{<Finance \/>\} \/>\n\s*/g, '');
content = content.replace(/<Route path="\/products" element=\{<Products \/>\} \/>\n\s*/g, '');

fs.writeFileSync('src/App.tsx', content, 'utf8');
