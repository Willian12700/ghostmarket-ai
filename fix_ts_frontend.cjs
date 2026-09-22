const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

const oldBlock = `            const scrapeData = await new Promise((resolve) => {
              const timeout = setTimeout(() => resolve({ success: false, reason: 'timeout' }), 8000);
              const listener = (event) => {
                clearTimeout(timeout);
                window.removeEventListener('GHOST_SCRAPE_RESPONSE', listener);
                resolve(event.detail);
              };
              window.addEventListener('GHOST_SCRAPE_RESPONSE', listener);
            });`;

const newBlock = `            const scrapeData = await new Promise<any>((resolve) => {
              const timeout = setTimeout(() => resolve({ success: false, reason: 'timeout' }), 8000);
              const listener = (event: any) => {
                clearTimeout(timeout);
                window.removeEventListener('GHOST_SCRAPE_RESPONSE', listener);
                resolve(event.detail);
              };
              window.addEventListener('GHOST_SCRAPE_RESPONSE', listener as EventListener);
            });`;

content = content.replace(oldBlock, newBlock);

fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
