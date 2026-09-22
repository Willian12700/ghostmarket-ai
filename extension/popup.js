document.getElementById('openApp').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:5173/offers' });
});

document.getElementById('runCron').addEventListener('click', () => {
  // Manda o Background Worker puxar o Firebase e checar todos os produtos
  chrome.runtime.sendMessage({ action: "run_cron_now" });
  window.close(); // Fecha o popup pra aba não bugar
});
