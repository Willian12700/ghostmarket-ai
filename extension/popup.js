document.getElementById("openJarvisBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://ghostmarket-ai.vercel.app/jarvis" });
});

document.getElementById("postTikTokBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    if (currentTab && currentTab.url && currentTab.url.includes("tiktok.com")) {
      chrome.tabs.sendMessage(currentTab.id, {
        action: "JARVIS_POST_VIDEO",
        caption: 'Ainda tem gente estudando meses de programação pra conseguir clientes... Olha o que a IA fez em 40s ⏱️ Comente "EU QUERO" ou veja o link na bio! #saas #ia #marketingdigital #leads'
      }, (response) => {
        alert("JARVIS: Vídeo e legenda injetados com sucesso no TikTok!");
      });
    } else {
      chrome.tabs.create({ url: "https://www.tiktok.com/creator-center/upload?from=upload" }, (newTab) => {
        alert("JARVIS: Abrindo TikTok Studio! Clique no botão novamente quando a tela carregar para injetar tudo automaticamente.");
      });
    }
  });
});
