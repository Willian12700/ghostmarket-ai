const fs = require('fs');
let content = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

// Fix wrapper
content = content.replace(
  '<div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full px-6 pb-12 overflow-hidden">',
  '<div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 pb-12 overflow-y-auto overflow-x-hidden custom-scrollbar pt-6">'
);

// We need to fix the backslashes again since I used write_to_file before without fixing them properly
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync('src/pages/PromptBuilder.tsx', content, 'utf8');
