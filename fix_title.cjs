const fs = require('fs');
let pubCode = fs.readFileSync('src/pages/PublicPartners.tsx', 'utf8');

// Replace the invisible text with a visible text-primary class, and update to "Lucre até 50%" to be accurate
pubCode = pubCode.replace(
  '<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Lucre 50%</span>',
  '<span className="text-primary">Lucre até 50%</span>'
);

fs.writeFileSync('src/pages/PublicPartners.tsx', pubCode, 'utf8');
