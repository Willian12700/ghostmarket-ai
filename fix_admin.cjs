const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

// add import
if (!content.includes('ActionLogs')) {
  content = content.replace("import { CheckoutStats } from '@/components/admin/CheckoutStats'", "import { CheckoutStats } from '@/components/admin/CheckoutStats'\nimport { ActionLogs } from '@/components/admin/ActionLogs'");
  
  // place it after NicheManager or before it
  content = content.replace("<NicheManager />", "<NicheManager />\n          <ActionLogs />");
  fs.writeFileSync('src/pages/AdminPanel.tsx', content, 'utf8');
}
