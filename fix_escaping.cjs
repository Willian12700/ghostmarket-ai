const fs = require('fs');
let content = fs.readFileSync('src/pages/Scanner.tsx', 'utf8');

// The write_to_file tool literally printed \` instead of `.
content = content.replace(/\\`/g, '`');
// It also literally printed \${ instead of ${
content = content.replace(/\\\$\{/g, '${');
// It literally printed \\n instead of \n in strings
content = content.replace(/\\\\n/g, '\\n');
// It literally printed \\/ instead of \/
content = content.replace(/\\\\\//g, '\\/');
// Let's also check for \D
content = content.replace(/\\\\D/g, '\\D');

fs.writeFileSync('src/pages/Scanner.tsx', content, 'utf8');
console.log('Fixed escaping!');
