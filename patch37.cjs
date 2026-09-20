const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
app = app.replace(
  `import { Settings } from './pages/Settings'`,
  `import { Settings } from './pages/Settings'\nimport { AdminPanel } from './pages/AdminPanel'`
);

// Add route inside <Route element={<MainLayout />}>
app = app.replace(
  `<Route path="/settings" element={<Settings />} />`,
  `<Route path="/settings" element={<Settings />} />\n          <Route path="/admin" element={<AdminPanel />} />`
);

fs.writeFileSync('src/App.tsx', app);
