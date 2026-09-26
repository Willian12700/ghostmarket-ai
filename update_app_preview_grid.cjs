const fs = require('fs');

let code = fs.readFileSync('src/components/ui/AppPreview.tsx', 'utf8');

// The line is: <div className="grid grid-cols-12 gap-6 mt-2">
code = code.replace('className="grid grid-cols-12 gap-6 mt-2"', 'className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2"');

fs.writeFileSync('src/components/ui/AppPreview.tsx', code, 'utf8');
