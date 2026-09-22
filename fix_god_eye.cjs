const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

// 1. Add import
if (!content.includes('useNavigate')) {
  content = content.replace(
    `import { Megaphone, AlertOctagon } from 'lucide-react';`,
    `import { Megaphone, AlertOctagon } from 'lucide-react';\nimport { useNavigate } from 'react-router-dom';`
  );
}

// 2. Add hook
if (!content.includes('const navigate = useNavigate()')) {
  content = content.replace(
    `export const AdminPanel = () => {`,
    `export const AdminPanel = () => {\n  const navigate = useNavigate();`
  );
}

// 3. Fix the button click
content = content.replace(
  `window.location.href = '/';`,
  `navigate('/');`
);

fs.writeFileSync('src/pages/AdminPanel.tsx', content, 'utf8');
