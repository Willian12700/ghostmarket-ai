const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

const oldMock = `          // Since Shopee requires Affiliate API tokens, we simulate the extraction for the MVP demonstration
          await new Promise(resolve => setTimeout(resolve, 800)); // fake loading
          
          setPreviewProduct({
            mlbId: mlbId || ('SHP-' + Math.floor(Math.random() * 1000000)),
            title: 'Produto Shopee em Monitoramento Fantasma',
            price: 99.90,
            originalPrice: 149.90,
            image: 'https://cf.shopee.com.br/file/b9195b0583bafefcf5ab2292eb63c0b3',
            permalink: url,
            platform: 'Shopee'
          })`;

const newMock = `          // Tenta comunicar com a Extensão do Chrome instalada no computador
          let title = 'Carregando dados da Shopee...';
          let price = 0;
          let originalPrice = 0;
          let image = 'https://cf.shopee.com.br/file/b9195b0583bafefcf5ab2292eb63c0b3'; // Fallback
          
          try {
            // Dispara o evento pra extensão
            window.dispatchEvent(new CustomEvent("GHOST_SCRAPE_REQUEST", { detail: { url: url } }));
            
            // Aguarda a resposta da extensão (máx 8 segundos)
            const scrapeData = await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => resolve(null), 8000); // 8s timeout se n tiver a extensao
              
              const listener = (event) => {
                clearTimeout(timeout);
                window.removeEventListener("GHOST_SCRAPE_RESPONSE", listener);
                resolve(event.detail);
              };
              
              window.addEventListener("GHOST_SCRAPE_RESPONSE", listener);
            });
            
            if (scrapeData && scrapeData.success) {
              title = scrapeData.title || title;
              price = scrapeData.price || price;
              originalPrice = price > 0 ? price * 1.3 : 0; // Fake original price 30% mais caro
              image = scrapeData.image || image;
            } else {
              // Se a extensão falhou ou não tá instalada, põe valores genéricos
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

content = content.replace(oldMock, newMock);
fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
