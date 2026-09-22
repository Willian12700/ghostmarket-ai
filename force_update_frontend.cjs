const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

const replacement = `          // Tenta comunicar com a Extensao
          let title = 'Carregando dados da Shopee...';
          let price = 0;
          let originalPrice = 0;
          let image = 'https://cf.shopee.com.br/file/b9195b0583bafefcf5ab2292eb63c0b3'; // Fallback
          
          try {
            window.dispatchEvent(new CustomEvent('GHOST_SCRAPE_REQUEST', { detail: { url: url } }));
            
            const scrapeData = await new Promise((resolve) => {
              const timeout = setTimeout(() => resolve(null), 8000);
              const listener = (event) => {
                clearTimeout(timeout);
                window.removeEventListener('GHOST_SCRAPE_RESPONSE', listener);
                resolve(event.detail);
              };
              window.addEventListener('GHOST_SCRAPE_RESPONSE', listener);
            });
            
            if (scrapeData && scrapeData.success) {
              title = scrapeData.title || title;
              price = scrapeData.price || price;
              originalPrice = price > 0 ? price * 1.3 : 0;
              image = scrapeData.image || image;
            } else {
              title = 'Produto da Shopee (Link Salvo)';
              price = 99.90;
              originalPrice = 149.90;
            }
          } catch(e) {
             console.error(e);
             title = 'Produto da Shopee (Link Salvo)';
             price = 99.90;
          }

          setPreviewProduct({
            mlbId: mlbId || ('SHP-' + Math.floor(Math.random() * 1000000)),
            title: title,
            price: price,
            originalPrice: originalPrice,
            image: image,
            permalink: url,
            platform: 'Shopee'
          })`;

content = content.replace(/await new Promise\(resolve => setTimeout\(resolve, 800\)\);.*?setPreviewProduct\(\{[\s\S]*?\}\)/m, replacement);

fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
