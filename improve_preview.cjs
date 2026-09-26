const fs = require('fs');
let hs = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');

hs = hs.replace(
  /<div className="w-full h-32 bg-\[\#000\] relative overflow-hidden border-b border-border shrink-0 rounded-t-2xl">/g,
  '<div className="w-full h-44 bg-[#050505] relative overflow-hidden border-b border-border shrink-0 rounded-t-3xl group-hover:opacity-90 transition-opacity">'
);

hs = hs.replace(
  /<div className="w-full h-32 bg-background flex items-center justify-center border-b border-border shrink-0 relative overflow-hidden rounded-t-2xl">/g,
  '<div className="w-full h-44 bg-background flex items-center justify-center border-b border-border shrink-0 relative overflow-hidden rounded-t-3xl">'
);

hs = hs.replace(
  /style=\{\{ transform: 'scale\(0\.25\)', width: '400%', height: '400%' \}\}/g,
  "style={{ transform: 'scale(0.333)', width: '300%', height: '300%' }}"
);

hs = hs.replace(
  /<div className="absolute inset-0 bg-gradient-to-t from-surface-elevated to-transparent" \/>/g,
  '<div className="absolute inset-0 bg-gradient-to-t from-[#130e1d] via-[#130e1d]/20 to-transparent" />'
);

fs.writeFileSync('src/pages/HostedSites.tsx', hs, 'utf8');
