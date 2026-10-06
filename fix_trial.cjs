const fs = require('fs');

let content = fs.readFileSync('src/pages/TrialLogin.tsx', 'utf8');

// Replace the fixed 5 minutes logic
content = content.replace(
  'const expiresAt = Date.now() + 5 * 60 * 1000;',
  'const durationMinutes = data.durationMinutes || 5;\n      const expiresAt = Date.now() + durationMinutes * 60 * 1000;'
);

content = content.replace(
  'Acesso VIP (5 Minutos)',
  'Acesso VIP Temporário'
);

content = content.replace(
  'código de teste (5 Minutos)',
  'código de teste'
);

fs.writeFileSync('src/pages/TrialLogin.tsx', content, 'utf8');
