const fs = require('fs');
let content = fs.readFileSync('extension/background.js', 'utf8');

const newListener = `chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "run_cron_now") {
    runCronJob();
    sendResponse({ status: "started" });
  }
  
  if (request.action === "scrape_now") {
    console.log("Abrindo aba fantasma para extração via SaaS...");
    chrome.tabs.create({ url: request.url, active: true }, (tab) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          
          setTimeout(() => {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                const title = document.title;
                const priceMatch = document.body.innerText.match(/R\\$\\s*(\\d{1,3}(?:\\.\\d{3})*,\\d{2})/);
                // Extrai a primeira imagem grande que achar (geralmente é a do produto)
                let image = 'https://cf.shopee.com.br/file/b9195b0583bafefcf5ab2292eb63c0b3'; // default fallback
                const imgTag = document.querySelector('div[style*="background-image"]');
                if (imgTag) {
                   const bg = imgTag.style.backgroundImage;
                   if (bg && bg.includes('url(')) {
                       image = bg.replace('url("', '').replace('url(', '').replace('")', '').replace(')', '');
                   }
                }
                
                return {
                  title: title,
                  priceStr: priceMatch ? priceMatch[0] : null,
                  image: image
                };
              }
            }, (results) => {
               chrome.tabs.remove(tab.id); // Fecha a aba
               if (results && results[0] && results[0].result) {
                 const data = results[0].result;
                 let finalPrice = 0;
                 if (data.priceStr) {
                    const cleanStr = data.priceStr.replace('R$', '').replace(/\\./g, '').replace(',', '.').trim();
                    finalPrice = parseFloat(cleanStr);
                 }
                 sendResponse({ success: true, title: data.title, price: finalPrice, image: data.image });
               } else {
                 sendResponse({ success: false });
               }
            });
          }, 3500); // 3.5 segundos
        }
      });
    });
    return true; // IMPORTANTE: Mantém a porta aberta para a resposta assíncrona
  }
});`;

content = content.replace(/chrome\.runtime\.onMessage\.addListener\([\s\S]*?\}\);/m, newListener);

fs.writeFileSync('extension/background.js', content, 'utf8');
