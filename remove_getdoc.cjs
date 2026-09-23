const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

content = content.replace(
    "import { doc, getDoc, onSnapshot } from 'firebase/firestore'",
    "import { doc, onSnapshot } from 'firebase/firestore'"
);

fs.writeFileSync('src/layouts/MainLayout.tsx', content, 'utf8');
