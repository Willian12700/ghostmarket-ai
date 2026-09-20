const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');
if (!app.includes(`import { AdminPanel }`)) {
  app = app.replace(
    `import { Settings } from './pages/Settings'`,
    `import { Settings } from './pages/Settings'\nimport { AdminPanel } from './pages/AdminPanel'`
  );
  fs.writeFileSync('src/App.tsx', app);
}

let st = fs.readFileSync('src/pages/Settings.tsx', 'utf8');
st = st.replace(/, Unlock/, '');
st = st.replace(/import \{ doc, setDoc \} from 'firebase\/firestore'/, '');
st = st.replace(/import \{ db \} from '@\/config\/firebase'/, '');

fs.writeFileSync('src/pages/Settings.tsx', st);
