const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');
if (!app.includes(`import { AdminPanel }`)) {
  app = "import { AdminPanel } from './pages/AdminPanel'\n" + app;
  fs.writeFileSync('src/App.tsx', app);
}

let st = fs.readFileSync('src/pages/Settings.tsx', 'utf8');
st = st.replace(/import \{ db, storage \} from '@\/config\/firebase'/, "import { storage } from '@/config/firebase'");
st = st.replace(/import \{ db \} from '@\/config\/firebase'/, "");
fs.writeFileSync('src/pages/Settings.tsx', st);
