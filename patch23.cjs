const fs = require('fs');
let sb = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

sb = sb.replace(
  "{ to: '/builder', icon: LayoutTemplate, label: 'Hospedagem de Sites' },",
  "{ to: '/builder', icon: LayoutTemplate, label: 'Hospedar Novo Site' },\n        { to: '/sites', icon: Globe, label: 'Meus Sites' },"
);

fs.writeFileSync('src/components/layout/Sidebar.tsx', sb);
