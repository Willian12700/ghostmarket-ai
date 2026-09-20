const fs = require('fs');

let settings = fs.readFileSync('src/pages/Settings.tsx', 'utf8');
settings = settings.replace(
  "ref(storage, `profile_pics/${user.uid}_${Date.now()}.jpg`)",
  "ref(storage, `logos/${user.uid}_profile_${Date.now()}.jpg`)"
);

fs.writeFileSync('src/pages/Settings.tsx', settings);
