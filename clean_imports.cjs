const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

content = content.replace("import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'", "");
content = content.replace("import { storage } from '@/config/firebase'", "");

fs.writeFileSync('src/pages/Settings.tsx', content);
