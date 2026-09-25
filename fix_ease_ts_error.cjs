const fs = require('fs');
let content = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

content = content.replace(
  'animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },',
  'animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4 } },'
);

fs.writeFileSync('src/pages/PromptBuilder.tsx', content, 'utf8');
