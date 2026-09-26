const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
let mainLayoutCode = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// Update App.tsx
if (!appCode.includes('ToastContainer')) {
  appCode = appCode.replace(
    "import { ErrorBoundary } from '@/components/layout/ErrorBoundary'",
    "import { ErrorBoundary } from '@/components/layout/ErrorBoundary'\nimport { ToastContainer } from '@/components/ui/ToastContainer'"
  );
  
  appCode = appCode.replace(
    "</ErrorBoundary>",
    "  <ToastContainer />\n    </ErrorBoundary>"
  );
  fs.writeFileSync('src/App.tsx', appCode, 'utf8');
}

// Update MainLayout.tsx
if (mainLayoutCode.includes('ToastContainer')) {
  mainLayoutCode = mainLayoutCode.replace("import { ToastContainer } from '@/components/ui/ToastContainer'\n", "");
  mainLayoutCode = mainLayoutCode.replace("      <ToastContainer />\n", "");
  fs.writeFileSync('src/layouts/MainLayout.tsx', mainLayoutCode, 'utf8');
}
