const fs = require('fs');
let settings = fs.readFileSync('src/pages/Settings.tsx', 'utf8');
settings = settings.replace(
  "import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage'",
  "import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'"
);
fs.writeFileSync('src/pages/Settings.tsx', settings);
