const fs = require('fs');

let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace('Code, LayoutTemplate', 'Code, LayoutTemplate, Globe');
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar);

let hosted = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');
hosted = hosted.replace('variant="outline"', 'variant="secondary"');
fs.writeFileSync('src/pages/HostedSites.tsx', hosted);
