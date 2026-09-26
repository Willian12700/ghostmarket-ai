const fs = require('fs');

let code = fs.readFileSync('src/pages/Scanner.tsx', 'utf8');

code = code.replace(/Instagram/g, 'AtSign');
// except for "Achar Insta Oculto" text and the URL
code = code.replace(/<AtSign className="w-4 h-4 text-pink-500 shrink-0" \/>/g, '<AtSign className="w-4 h-4 text-pink-500 shrink-0" />');
// Wait, I replaced Instagram globally, so the URL might be site:AtSign.com!
// Let's just restore the file from git and re-apply safely.
