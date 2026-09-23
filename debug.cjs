const fs = require('fs');
let content = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');

// Debug script to see where it failed.
console.log("Has targetCardHeader?", content.includes('<div className="flex items-start justify-between mb-4">\n                      <div className="flex items-center gap-3">'));

console.log("Has targetViews?", content.includes('<span className="text-xs font-bold text-white">{site.views || 0}</span>\n                        </div>\n                      </div>'));

console.log("Has targetActions?", content.includes('<div className="flex gap-2">\n                        <button onClick={() => {'));
