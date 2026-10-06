const fs = require('fs');
['src/pages/QuizAnalytics.tsx', 'src/pages/QuizPublic.tsx'].forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/\\\$/g, '$');
  content = content.replace(/\\`/g, '`');
  fs.writeFileSync(f, content);
});
