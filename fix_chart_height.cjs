const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

content = content.replace(
  'className="lg:col-span-6 bg-panel border border-border rounded-3xl p-6 lg:p-8 relative overflow-hidden group"',
  'className="lg:col-span-6 bg-panel border border-border rounded-3xl p-6 lg:p-8 relative overflow-hidden group flex flex-col min-h-[400px]"'
);

content = content.replace(
  'className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 relative z-10"',
  'className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 relative z-10 shrink-0"'
);

content = content.replace(
  'className="h-[300px] w-full relative z-10"',
  'className="flex-1 w-full relative z-10"'
);

fs.writeFileSync('src/pages/Dashboard.tsx', content, 'utf8');
