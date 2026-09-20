const fs = require('fs');

// 1. App.tsx
let appStr = fs.readFileSync('src/App.tsx', 'utf8');
if (!appStr.includes('Chatbots')) {
  appStr = appStr.replace("import { Scanner } from '@/pages/Scanner'", "import { Scanner } from '@/pages/Scanner'\nimport { Chatbots } from '@/pages/Chatbots'");
  appStr = appStr.replace('<Route path="/scanner" element={<Scanner />} />', '<Route path="/scanner" element={<Scanner />} />\n              <Route path="/chatbots" element={<Chatbots />} />');
  fs.writeFileSync('src/App.tsx', appStr, 'utf8');
}

// 2. Sidebar.tsx
let sideStr = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
if (!sideStr.includes('/chatbots')) {
  // Add Bot icon to imports
  if (!sideStr.includes('Bot,')) {
    sideStr = sideStr.replace("Search, FileText", "Search, FileText, Bot");
  }
  
  sideStr = sideStr.replace("{ to: '/sites', icon: Globe, label: 'Meus Sites' },", "{ to: '/sites', icon: Globe, label: 'Meus Sites' },\n          { to: '/chatbots', icon: Bot, label: 'Chatbots de IA' },");
  fs.writeFileSync('src/components/layout/Sidebar.tsx', sideStr, 'utf8');
}

console.log('Added Chatbots to routes and sidebar');
