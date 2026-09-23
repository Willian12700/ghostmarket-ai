const fs = require('fs');
let content = fs.readFileSync('src/pages/SiteViewer.tsx', 'utf8');

const target = `        if (docSnap.exists()) {
          const data = docSnap.data()
          
          if (data.isRedirect && data.redirectUrl) {`;

const replacement = `        if (docSnap.exists()) {
          const data = docSnap.data()
          
          if (data.isActive === false) {
            setHtml('<div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #000; color: #fff; font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 20px;"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 24px;"><path d="M18.36 6.64A9 9 0 0 1 20.77 15"></path><path d="M6.16 6.16a9 9 0 1 0 12.68 12.68"></path><path d="M12 2v4"></path><path d="m2 2 20 20"></path></svg><h1 style="font-size: 24px; font-weight: bold; margin-bottom: 12px; margin-top: 0;">Site Temporariamente Indisponível</h1><p style="color: #a1a1aa; max-width: 400px; line-height: 1.5;">Este site foi desativado pelo proprietário. Se você é o dono, acesse o painel GhostMarket para reativar o domínio.</p></div>');
            setLoading(false);
            return;
          }

          if (data.isRedirect && data.redirectUrl) {`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/SiteViewer.tsx', content, 'utf8');
