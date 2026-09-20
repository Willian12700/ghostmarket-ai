const fs = require('fs');
let admin = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

admin = admin.replace(
  "import { Search, ShieldAlert, Circle, Calendar, X, Globe, LayoutTemplate, Copy } from 'lucide-react'",
  "import { Search, ShieldAlert, Circle, Calendar, X, Globe, LayoutTemplate, Copy, Megaphone, AlertOctagon } from 'lucide-react'"
);

// Fallback if the string had different formatting
if (!admin.includes('AlertOctagon')) {
  admin = admin.replace(
    "from 'lucide-react'",
    ", Megaphone, AlertOctagon } from 'lucide-react'"
  );
}

fs.writeFileSync('src/pages/AdminPanel.tsx', admin, 'utf8');
console.log('Fixed imports');
