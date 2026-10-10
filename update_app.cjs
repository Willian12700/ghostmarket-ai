const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');
const replacement =   useEffect(() => {
    initAuthListener()
    
    // Captura UTMs da URL e salva no localStorage
    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source');
    const medium = params.get('utm_medium');
    const campaign = params.get('utm_campaign');
    
    if (source) localStorage.setItem('utm_source', source);
    if (medium) localStorage.setItem('utm_medium', medium);
    if (campaign) localStorage.setItem('utm_campaign', campaign);
  }, [initAuthListener]);

content = content.replace(/  useEffect\(\(\) => \{\n    initAuthListener\(\)\n  \}, \[initAuthListener\]\)/g, replacement);
fs.writeFileSync('src/App.tsx', content, 'utf8');
