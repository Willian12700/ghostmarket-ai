const fs = require('fs');

let sidebarContent = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// I will just revert Sidebar.tsx to the HEAD~1 logic and append PAINEL SOCIO conditionally.
