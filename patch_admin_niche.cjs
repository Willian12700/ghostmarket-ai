const fs = require('fs');
let admin = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

// Import NicheManager
admin = admin.replace(
  "import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'",
  "import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'\nimport { NicheManager } from '@/components/admin/NicheManager'"
);

// Inject after Liberar Acesso Card
const liberarAcessoEnd = admin.indexOf('</Card>', admin.indexOf('Liberar Acesso (VIP / Grátis)')) + '</Card>'.length;

if (liberarAcessoEnd !== -1) {
  admin = admin.substring(0, liberarAcessoEnd) + '\n\n        <NicheManager />' + admin.substring(liberarAcessoEnd);
  fs.writeFileSync('src/pages/AdminPanel.tsx', admin, 'utf8');
  console.log('Injected NicheManager');
} else {
  console.log('Failed to find Liberar Acesso Card');
}
