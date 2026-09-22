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
      const fields = doc.fields;
      const url = getFirestoreValue(fields.permalink);
      let targetPrice = getFirestoreValue(fields.targetPrice);
      
      if (typeof targetPrice === 'string') {
        targetPrice = parseFloat(targetPrice);
      }
      
      const userId = getFirestoreValue(fields.userId);
      const title = getFirestoreValue(fields.title) || 'Produto';
      
      await checkSingleProduct(url, targetPrice, userId, title);
    }
    
    chrome.notifications.create({ type: 'basic', iconUrl: 'icon.png', title: 'Motor Finalizado', message: 'Todos os produtos foram verificados na Shopee!' });
    
  } catch (err) {
    console.error("Erro no motor:", err);
    chrome.notifications.create({ type: 'basic', iconUrl: 'icon.png', title: 'Erro no Motor', message: err.message });
  }
}

function checkSingleProduct(url, targetPrice, userId, title) {
  return new Promise((resolve) => {
    chrome.tabs.create({ url: url, active: true }, (tab) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          setTimeout(() => {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                const priceMatch = document.body.innerText.match(/R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})/);
                return priceMatch ? priceMatch[0] : null;
              }
            }, async (results) => {
               chrome.tabs.remove(tab.id);
               
               if (results && results[0] && results[0].result) {
                  const priceStr = results[0].result.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
                  const currentPrice = parseFloat(priceStr);
                  
                  if (currentPrice > 0 && currentPrice <= targetPrice) {
                    
                    // Mostra a notificação direto no Windows!
                    chrome.notifications.create({
                      type: 'basic',
                      iconUrl: 'icon.png',
                      title: 'META ATINGIDA! 🤑',
                      message: `O produto "${title}" caiu para R$ ${currentPrice.toFixed(2)}!`
                    });
                    
                    await createNotificationInDB(userId, title, currentPrice, url);
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

async function createNotificationInDB(userId, title, currentPrice, url) {
  const docData = {
    fields: {
      userId: { stringValue: userId },
      title: { stringValue: "Alerta de Preço Atingido!" },
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
