const PROJECT_ID = "ghostmarket-ai-2cc26";

chrome.alarms.create("checkPrices", { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkPrices") {
    runCronJob();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "run_cron_now") {
    runCronJob();
    sendResponse({ status: "started" });
  }
  
  if (request.action === "scrape_now") {
    chrome.tabs.create({ url: request.url, active: true }, (tab) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          setTimeout(() => {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                const title = document.title;
                const priceMatch = document.body.innerText.match(/R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})/);
                let image = 'https://cf.shopee.com.br/file/b9195b0583bafefcf5ab2292eb63c0b3';
                const imgTag = document.querySelector('div[style*="background-image"]');
                if (imgTag) {
                   const bg = imgTag.style.backgroundImage;
                   if (bg && bg.includes('url(')) {
                       image = bg.replace('url("', '').replace('url(', '').replace('")', '').replace(')', '');
                   }
                }
                return { title: title, priceStr: priceMatch ? priceMatch[0] : null, image: image };
              }
            }, (results) => {
               chrome.tabs.remove(tab.id);
               if (results && results[0] && results[0].result) {
                 const data = results[0].result;
                 let finalPrice = 0;
                 if (data.priceStr) {
                    const cleanStr = data.priceStr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
                    finalPrice = parseFloat(cleanStr);
                 }
                 sendResponse({ success: true, title: data.title, price: finalPrice, image: data.image });
               } else {
                 sendResponse({ success: false });
               }
            });
          }, 3500);
        }
      });
    });
    return true;
  }
});

function getFirestoreValue(field) {
  if (!field) return null;
  if (field.stringValue !== undefined) return field.stringValue;
  if (field.integerValue !== undefined) return Number(field.integerValue);
  if (field.doubleValue !== undefined) return Number(field.doubleValue);
  return null;
}

async function runCronJob() {
  console.log("Iniciando varredura no banco de dados Firebase...");
  
  try {
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/offer_tracking`);
    const data = await response.json();
    
    if (!data.documents || data.documents.length === 0) {
      chrome.notifications.create({ type: 'basic', iconUrl: 'icon.png', title: 'Motor Finalizado', message: 'Nenhum produto sendo monitorado no banco de dados.' });
      return;
    }

    for (const doc of data.documents) {
      const docId = doc.name.split('/').pop();
      const fields = doc.fields;
      const url = getFirestoreValue(fields.permalink);
      let targetPrice = getFirestoreValue(fields.targetPrice);
      
      if (typeof targetPrice === 'string') {
        targetPrice = parseFloat(targetPrice);
      }
      
      const userId = getFirestoreValue(fields.userId);
      const title = getFirestoreValue(fields.title);
      
      await checkSingleProduct(url, targetPrice, userId, title, docId);
    }
    
    chrome.notifications.create({ type: 'basic', iconUrl: 'icon.png', title: 'Motor Finalizado', message: 'Todos os produtos foram verificados na Shopee!' });
    
  } catch (err) {
    console.error("Erro no motor:", err);
    chrome.notifications.create({ type: 'basic', iconUrl: 'icon.png', title: 'Erro no Motor', message: err.message });
  }
}

function checkSingleProduct(url, targetPrice, userId, title, docId) {
  return new Promise((resolve) => {
    chrome.tabs.create({ url: url, active: true }, (tab) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          setTimeout(() => {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                const title = document.title;
                const priceMatch = document.body.innerText.match(/R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})/);
                let image = 'https://cf.shopee.com.br/file/b9195b0583bafefcf5ab2292eb63c0b3';
                const imgTag = document.querySelector('div[style*="background-image"]');
                if (imgTag) {
                   const bg = imgTag.style.backgroundImage;
                   if (bg && bg.includes('url(')) {
                       image = bg.replace('url("', '').replace('url(', '').replace('")', '').replace(')', '');
                   }
                }
                return { title: title, priceStr: priceMatch ? priceMatch[0] : null, image: image };
              }
            }, async (results) => {
               chrome.tabs.remove(tab.id);
               
               if (results && results[0] && results[0].result) {
                  const data = results[0].result;
                  let currentPrice = 0;
                  if (data.priceStr) {
                    const priceStr = data.priceStr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
                    currentPrice = parseFloat(priceStr);
                  }
                  
                  // Se o titulo no banco ta generico, atualiza no banco com o titulo/imagem real!
                  if (title.includes('ERRO') || title.includes('Link Salvo') || title.includes('Carregando')) {
                     await updateProductInDB(docId, data.title, data.image, currentPrice);
                  }
                  
                  if (currentPrice > 0 && currentPrice <= targetPrice) {
                    await createNotificationInDB(userId, data.title, currentPrice, url);
                  }
               }
               resolve();
            });
          }, 4000);
        }
      });
    });
  });
}

async function updateProductInDB(docId, newTitle, newImage, currentPrice) {
  const updateData = {
    fields: {
      title: { stringValue: newTitle },
      image: { stringValue: newImage },
      price: { doubleValue: currentPrice }
    }
  };
  
  await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/offer_tracking/${docId}?updateMask.fieldPaths=title&updateMask.fieldPaths=image&updateMask.fieldPaths=price`, {
    method: 'PATCH',
    body: JSON.stringify(updateData)
  });
}

async function createNotificationInDB(userId, title, currentPrice, url) {
  const docData = {
    fields: {
      userId: { stringValue: userId },
      title: { stringValue: "🤑 Alerta de Preço Atingido!" },
      text: { stringValue: `O produto "${title}" caiu para R$ ${currentPrice.toFixed(2)} e atingiu sua meta!` },
      unread: { booleanValue: true },
      link: { stringValue: url },
      createdAt: { timestampValue: new Date().toISOString() }
    }
  };
  
  await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/notifications`, {
    method: 'POST',
    body: JSON.stringify(docData)
  });
}
