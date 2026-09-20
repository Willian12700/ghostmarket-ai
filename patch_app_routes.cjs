const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
app = app.replace("import { Dashboard } from '@/pages/Dashboard'", "import { Dashboard } from '@/pages/Dashboard'\nimport { Ranking } from '@/pages/Ranking'");

// Add route
app = app.replace('<Route path="/dashboard" element={<Dashboard />} />', '<Route path="/dashboard" element={<Dashboard />} />\n              <Route path="/ranking" element={<Ranking />} />');

fs.writeFileSync('src/App.tsx', app, 'utf8');

let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// Add icon import
sidebar = sidebar.replace("import { LayoutDashboard,", "import { LayoutDashboard, Trophy,");

// Add link
sidebar = sidebar.replace("{ to: '/dashboard', icon: LayoutDashboard, label: 'Painel' }", "{ to: '/dashboard', icon: LayoutDashboard, label: 'Painel' },\n          { to: '/ranking', icon: Trophy, label: 'Top Global' }");

fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar, 'utf8');

console.log('Added Ranking to App and Sidebar');
