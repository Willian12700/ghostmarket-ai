const fs = require('fs');

let main = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');
main = main.replace('className="flex-1 p-6 overflow-x-hidden"', 'className="flex-1 p-4 md:p-6 overflow-x-hidden"');
fs.writeFileSync('src/layouts/MainLayout.tsx', main, 'utf8');

let topbar = fs.readFileSync('src/components/layout/Topbar.tsx', 'utf8');
topbar = topbar.replace('justify-between px-6 sticky', 'justify-between px-4 md:px-6 sticky');
topbar = topbar.replace('text-2xl font-bold', 'text-xl md:text-2xl font-bold');
fs.writeFileSync('src/components/layout/Topbar.tsx', topbar, 'utf8');

console.log('Mobile padding patched');
