const fs = require('fs');

let sv = fs.readFileSync('src/pages/SiteViewer.tsx', 'utf8');

sv = sv.replace(
  `sandbox="allow-scripts allow-same-origin allow-popups allow-forms"`,
  `sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-top-navigation allow-top-navigation-by-user-activation"`
);

fs.writeFileSync('src/pages/SiteViewer.tsx', sv);
