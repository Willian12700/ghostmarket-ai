const fs = require('fs');

let sv = fs.readFileSync('src/pages/SiteViewer.tsx', 'utf8');

const redirectLogic = `
        if (docSnap.exists()) {
          const data = docSnap.data()
          
          if (data.isRedirect && data.redirectUrl) {
            window.location.replace(data.redirectUrl)
            return;
          }
`;

sv = sv.replace(
  `if (docSnap.exists()) {\n          const data = docSnap.data()`,
  redirectLogic.trim()
);

fs.writeFileSync('src/pages/SiteViewer.tsx', sv);
