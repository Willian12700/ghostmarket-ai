// Este script roda DENTRO da página do seu SaaS (localhost ou vercel)
console.log("GhostMarket AI: Ponte de Comunicação Iniciada!");

// Escuta a página web pedindo pra raspar um produto
window.addEventListener("GHOST_SCRAPE_REQUEST", (event) => {
  const url = event.detail.url;
  console.log("Recebido pedido do SaaS para raspar:", url);

  // Manda a ordem pro background.js
  chrome.runtime.sendMessage({ action: "scrape_now", url: url }, (response) => {
    console.log("Resposta do Background Worker:", response);
    // Manda de volta pra página web
    window.dispatchEvent(new CustomEvent("GHOST_SCRAPE_RESPONSE", { detail: response }));
  });
});
