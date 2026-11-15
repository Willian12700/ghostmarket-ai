// Watchdog de Monitoramento Ativo do Servidor Moto G60 (Termux + Jarvis)
// Pode ser chamado a cada 5 ou 10 minutos por cron jobs externos (ex: cron-job.org, uptimerobot, vercel cron)

const CALLMEBOT_PHONE = '558496656016';
const CALLMEBOT_APIKEY = '1083057';

async function sendCallMeBotAlert(text) {
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_PHONE}&text=${encodeURIComponent(text)}&apikey=${CALLMEBOT_APIKEY}`;
    await fetch(url);
  } catch (e) {
    console.error('Erro CallMeBot Watchdog:', e.message);
  }
}

export default async function handler(req, res) {
  const tunnelBase = process.env.MOTO_G60_TUNNEL_URL || 'https://preceding-notifications-meal-dollar.trycloudflare.com';
  const targetUrl = `${tunnelBase.replace(/\/+$/, '')}/api/status`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const start = Date.now();
    const response = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeout);
    const latencyMs = Date.now() - start;

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({
        status: 'ONLINE',
        latencyMs,
        tunnelUrl: tunnelBase,
        serverInfo: data
      });
    }

    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  } catch (err) {
    console.error(`[Watchdog] Moto G60 Inacessível: ${err.message}`);

    // Dispara alerta direto no WhatsApp pessoal do Willian
    await sendCallMeBotAlert(
      `🚨 *ALERTA WATCHDOG GHOSTMARKET*\n\n` +
      `O servidor do Moto G60 (Jarvis) parece ter caído ou o túnel está offline!\n` +
      `🔗 *Túnel:* ${tunnelBase}\n` +
      `⚠️ *Erro:* ${err.message}\n\n` +
      `👉 Verifique o celular Moto G60 para manter as vendas e o atendimento funcionando!`
    );

    return res.status(503).json({
      status: 'OFFLINE',
      error: err.message,
      tunnelUrl: tunnelBase,
      alertDispatchedToWhatsApp: true
    });
  }
}
