/**
 * JARVIS AUTO-POSTER (TIKTOK CONTENT SCRIPT)
 * Executa dentro do TikTok Studio com a sua sessão ativa e segura
 */

console.log("🤖 [JARVIS EXTENSION] Módulo Auto-Poster injetado no TikTok Studio!");

// Escuta comandos vindos do Background / Painel Jarvis
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "JARVIS_POST_VIDEO") {
    console.log("🎬 [JARVIS EXTENSION] Ordem de postagem recebida!", request);

    const caption = request.caption || 'Ainda tem gente estudando meses de programação pra conseguir clientes... Olha o que a IA fez em 40s ⏱️ Comente "EU QUERO" ou veja o link na bio! #saas #ia #marketingdigital';

    try {
      // 1. Preencher a legenda
      const editor = document.querySelector('div[contenteditable="true"]');
      if (editor) {
        editor.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        document.execCommand('insertText', false, caption);
        console.log("✅ [JARVIS EXTENSION] Legenda preenchida com sucesso!");
      }

      // 2. Se houver comando para agendar
      if (request.scheduleTime) {
        console.log("⏰ [JARVIS EXTENSION] Configurando agendamento para:", request.scheduleTime);
        const scheduleCheckbox = document.querySelector('input[type="checkbox"][aria-label*="Schedule"], input[type="checkbox"][aria-label*="Agendar"]');
        if (scheduleCheckbox && !scheduleCheckbox.checked) {
          scheduleCheckbox.click();
        }
      }

      sendResponse({ status: "success", message: "Vídeo preparado e legenda injetada!" });
    } catch (err) {
      console.error("❌ [JARVIS EXTENSION] Erro ao injetar dados:", err);
      sendResponse({ status: "error", error: err.message });
    }
  }
  return true;
});
