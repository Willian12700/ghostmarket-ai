const fs = require('fs');
let admin = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

admin = "import { Megaphone, AlertOctagon } from 'lucide-react';\n" + admin;

fs.writeFileSync('src/pages/AdminPanel.tsx', admin, 'utf8');
console.log('Forced import');
