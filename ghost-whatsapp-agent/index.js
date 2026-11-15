import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion,
  downloadMediaMessage
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { 
  getAiResponse, 
  buildFollowUpMessage, 
  formatBrazilWhatsAppPhone, 
  buildCaktoPixRecoveryMessage, 
  buildCaktoApprovedWelcomeMessage,
  buildQuizLeadOutreachMessage,
  analyzeTikTokMetrics,
  splitIntoWhatsAppBalloons,
  resolveSpintax,
  transcribeAudioWithWhisper,
  extractTextFromImage,
  verifyCustomerPurchase
} from './brain.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_FOLDER = path.join(__dirname, 'auth_info');
const QR_HTML_PATH = path.join(__dirname, 'scan_qr.html');
const LOCK_FILE = path.join(__dirname, 'agent.pid');
const FOLLOWUP_FILE = path.join(__dirname, 'leads_followup.json');
const CAKTO_QUEUE_FILE = path.join(__dirname, 'cakto_queue.json');
const PAUSED_CHATS_FILE = path.join(__dirname, 'paused_chats.json');

// Tempos de Follow-up Automático
const FOLLOWUP_STAGE1_MS = 25 * 60 * 1000;       // 25 minutos
const FOLLOWUP_STAGE2_MS = 18 * 60 * 60 * 1000;  // 18 horas
const FOLLOWUP_STAGE3_MS = 24 * 60 * 60 * 1000;  // 24 horas adicionais (Cupom Relâmpago R$ 10 OFF)

function loadFollowUps() {
  try {
    if (fs.existsSync(FOLLOWUP_FILE)) {
      return JSON.parse(fs.readFileSync(FOLLOWUP_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Erro ao ler leads_followup.json:', e.message);
  }
  return {};
}

function saveFollowUps(data) {
  try {
    fs.writeFileSync(FOLLOWUP_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Erro ao salvar leads_followup.json:', e.message);
  }
}

let leadsFollowUp = loadFollowUps();

// Gestão de Chats Pausados (Intervenção Humana / Takeover Manual)
function loadPausedChats() {
  try {
    if (fs.existsSync(PAUSED_CHATS_FILE)) {
      return JSON.parse(fs.readFileSync(PAUSED_CHATS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Erro ao ler paused_chats.json:', e.message);
  }
  return {};
}

function savePausedChats(data) {
  try {
    fs.writeFileSync(PAUSED_CHATS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Erro ao salvar paused_chats.json:', e.message);
  }
}

let pausedChatsCache = loadPausedChats();

export function isChatPaused(phone, jid) {
  const clean = formatBrazilWhatsAppPhone(phone) || (phone ? String(phone).replace(/\D/g, '') : null);
  if (clean && pausedChatsCache[clean]) return true;
  if (jid && pausedChatsCache[jid]) return true;
  return false;
}

export function setChatPaused(phoneOrJid, paused = true, reason = 'Atendimento Manual') {
  const clean = formatBrazilWhatsAppPhone(phoneOrJid) || String(phoneOrJid).replace(/\D/g, '');
  const key = clean || phoneOrJid;
  if (paused) {
    pausedChatsCache[key] = {
      phone: key,
      paused: true,
      pausedAt: Date.now(),
      reason
    };
  } else {
    delete pausedChatsCache[key];
    if (clean) delete pausedChatsCache[clean];
    if (phoneOrJid) delete pausedChatsCache[phoneOrJid];
  }
  savePausedChats(pausedChatsCache);
  return pausedChatsCache[key];
}

try {
  if (fs.existsSync(LOCK_FILE)) {
    const oldPid = parseInt(fs.readFileSync(LOCK_FILE, 'utf-8').trim(), 10);
    if (oldPid && oldPid !== process.pid) {
      try {
        process.kill(oldPid, 'SIGKILL');
        console.log(`🧹 Processo antigo duplicado (PID ${oldPid}) encerrado.`);
      } catch (_) {}
    }
  }
  fs.writeFileSync(LOCK_FILE, String(process.pid), 'utf-8');
} catch (_) {}

const OWNER_RAW_NUMBER = '5584996656016';
let resolvedOwnerJid = null;
let activeSock = null;
let reconnectTimer = null;
let followUpInterval = null;
let caktoInterval = null;
let watchdogInterval = null;
let lastScheduledHour = null;
let lastStatusPostHour = null;
let lastBatteryAlertTime = 0;

// Lê informações reais da bateria no Linux / Android (Moto G60)
function getBatteryInfo() {
  try {
    const capacityPath = '/sys/class/power_supply/battery/capacity';
    if (fs.existsSync(capacityPath)) {
      const cap = parseInt(fs.readFileSync(capacityPath, 'utf-8').trim(), 10);
      let status = 'Descarregando';
      const statusPath = '/sys/class/power_supply/battery/status';
      if (fs.existsSync(statusPath)) {
        const rawStatus = fs.readFileSync(statusPath, 'utf-8').trim();
        status = rawStatus === 'Charging' ? 'Carregando ⚡' : 'Descarregando 🔋';
      }
      return { percent: cap, status };
    }
  } catch (_) {}
  return { percent: null, status: 'Conectado à fonte' };
}

// Gera o Relatório Executivo Completo de Vendas, Conversão e Saúde (CFO)
function generateCfoReport(titleHeader = '📊 *RELATÓRIO EXECUTIVO GHOSTMARKET (CFO)*') {
  let queue = [];
  try {
    if (fs.existsSync(CAKTO_QUEUE_FILE)) {
      queue = JSON.parse(fs.readFileSync(CAKTO_QUEUE_FILE, 'utf-8'));
    }
  } catch (_) {}

  const allLeads = Object.values(leadsFollowUp);
  const activeCount = allLeads.filter(l => !l.converted && l.stage < 2).length;
  const withLinkCount = allLeads.filter(l => l.sentCheckoutLink).length;

  const approvedList = queue.filter(item => item.eventType === 'purchase_approved' || item.eventType === 'approved' || item.eventType === 'paid');
  const pixList = queue.filter(item => item.eventType === 'waiting_payment' || item.eventType === 'pix_gerado' || item.eventType === 'pix_generated');

  // Vendas de hoje (horário de Brasília)
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const approvedToday = approvedList.filter(item => (item.queuedAt || 0) >= startOfDay);
  const totalFaturadoHoje = approvedToday.reduce((acc, item) => acc + Number(item.amount || 0), 0);
  const totalFaturadoGeral = approvedList.reduce((acc, item) => acc + Number(item.amount || 0), 0);

  const pixToday = pixList.filter(item => (item.queuedAt || 0) >= startOfDay);

  const totalPixCount = pixList.length;
  const totalApprovedCount = approvedList.length;
  const conversionRate = totalPixCount > 0 
    ? ((totalApprovedCount / (totalPixCount + totalApprovedCount)) * 100).toFixed(1) + '%' 
    : (totalApprovedCount > 0 ? '100%' : '0%');

  const batt = getBatteryInfo();
  const battText = batt.percent !== null ? `${batt.percent}% (${batt.status})` : 'Conectado via USB / Carregador';

  const uptimeHours = (process.uptime() / 3600).toFixed(1);
  const freeRamMb = Math.round(os.freemem() / 1024 / 1024);

  return `${titleHeader}\n\n` +
    `💰 *Faturamento Hoje:* R$ ${totalFaturadoHoje.toFixed(2)}\n` +
    `🏆 *Vendas Aprovadas Hoje:* ${approvedToday.length}\n` +
    `⚡ *PIX Gerados Hoje:* ${pixToday.length}\n` +
    `📈 *Faturamento Acumulado:* R$ ${totalFaturadoGeral.toFixed(2)} (${totalApprovedCount} vendas)\n` +
    `🎯 *Taxa de Conversão:* ${conversionRate}\n\n` +
    `👥 *FUNIL DE ATENDIMENTO (JARVIS):*\n` +
    `- Total de Leads Atendidos: ${allLeads.length}\n` +
    `- Leads com Link Cakto: ${withLinkCount}\n` +
    `- Em Recuperação Ativa (25m / 18h): ${activeCount}\n\n` +
    `📱 *SAÚDE DO MOTO G60 (SENTINELA):*\n` +
    `- Bateria: ${battText}\n` +
    `- Uptime: ${uptimeHours} horas ininterruptas\n` +
    `- Memória RAM Livre: ${freeRamMb} MB\n` +
    `- Servidor: 🟢 Online 24/7 (Túnel Cloudflare Ativo)`;
}

// Sentinela de Uptime, Bateria e Relatórios Agendados (09:00 e 21:00)
function checkScheduledReportsAndWatchdog() {
  if (!activeSock || !resolvedOwnerJid) return;

  // 1. Relatórios Diários Agendados (09:00 e 21:00 horário de Brasília)
  try {
    const brDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const hour = brDate.getHours();
    const minute = brDate.getMinutes();

    if ((hour === 9 || hour === 21) && minute === 0 && lastScheduledHour !== hour) {
      lastScheduledHour = hour;
      const periodName = hour === 9 ? '☀️ *BOM DIA! RELATÓRIO MATINAL GHOSTMARKET (CFO)*' : '🌙 *BOA NOITE! FECHAMENTO DO DIA GHOSTMARKET (CFO)*';
      const report = generateCfoReport(periodName);
      activeSock.sendMessage(resolvedOwnerJid, { text: report }).catch(e => console.error('Erro envio relatório agendado CFO:', e.message));
    } else if (minute !== 0) {
      lastScheduledHour = null;
    }
  } catch (err) {
    console.error('Erro checagem hora relatório CFO:', err.message);
  }

  // 2. Sentinela de Bateria (Alerta se <= 20% fora da tomada)
  try {
    const batt = getBatteryInfo();
    const nowMs = Date.now();
    if (batt.percent !== null && batt.percent <= 20 && !batt.status.includes('Carregando')) {
      if (nowMs - lastBatteryAlertTime > 30 * 60 * 1000) {
        lastBatteryAlertTime = nowMs;
        const alertMsg = `🚨 *ALERTA SENTINELA: MOTO G60 COM BATERIA BAIXA (${batt.percent}%)!*\n\n⚠️ O aparelho está desconectado da tomada e a bateria caiu para ${batt.percent}%.\n🔌 *Conecte o carregador para não interromper os atendimentos automáticos e a recuperação de vendas!*`;
        activeSock.sendMessage(resolvedOwnerJid, { text: alertMsg }).catch(e => console.error('Erro envio alerta bateria:', e.message));
      }
    }
  } catch (err) {
    console.error('Erro checagem sentinela bateria:', err.message);
  }

  // 3. Auto-Postador de Status no WhatsApp (Stories do Chip - 11:00, 16:00 e 20:00)
  try {
    const brDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const hour = brDate.getHours();
    const minute = brDate.getMinutes();

    if ((hour === 11 || hour === 16 || hour === 20) && minute === 0 && lastStatusPostHour !== hour) {
      lastStatusPostHour = hour;

      const statusMessages = [
        "🔥 Mais um site profissional entregue em 60 segundos com IA! O dono da barbearia pagou R$ 400 no Pix com 1 clique.",
        "🚀 O Radar de Clientes do GhostMarket achou mais de 20 empresas sem site aqui na região hoje. Quem tem a ferramenta bota dinheiro no bolso todo dia!",
        "⚡ Restam poucas vagas com acesso vitalício de R$ 49,99 único e 7 dias de garantia incondicional. Quem quiser ver como funciona, me chama no privado!"
      ];

      const pick = statusMessages[Math.floor(Math.random() * statusMessages.length)];
      activeSock.sendMessage('status@broadcast', { text: pick }).catch(e => console.warn('Erro ao postar status:', e.message));
      console.log(`📢 [STATUS WHATSAPP AUTO] Postado às ${hour}:00: "${pick.slice(0, 45)}..."`);
    } else if (minute !== 0) {
      lastStatusPostHour = null;
    }
  } catch (err) {
    console.error('Erro loop status WhatsApp:', err.message);
  }
}

// Garante que o health_server.js na porta 3333 tenha suporte a /api/cakto-event, /api/logs, /api/pause-chat e upload de áudio
function ensureHealthServerCaktoEndpoint() {
  const healthServerPath = path.join(__dirname, '..', 'ghost-whatsapp-server', 'health_server.js');
  if (!fs.existsSync(healthServerPath)) return;

  try {
    let currentCode = fs.readFileSync(healthServerPath, 'utf-8');
    let changed = false;

    if (!currentCode.includes('audioBase64') && currentCode.includes('payload.indexJs')) {
      currentCode = currentCode.replace(
        "if (payload.indexJs) fs.writeFileSync(path.join(HOME, 'ghost-whatsapp-agent', 'index.js'), payload.indexJs, 'utf-8');",
        "if (payload.indexJs) fs.writeFileSync(path.join(HOME, 'ghost-whatsapp-agent', 'index.js'), payload.indexJs, 'utf-8');\n        if (payload.audioBase64) fs.writeFileSync(path.join(HOME, 'ghost-whatsapp-agent', 'audio_prova_social.mp3'), Buffer.from(payload.audioBase64, 'base64'));"
      );
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(healthServerPath, currentCode, 'utf-8');
      exec('pm2 restart ghost-server 2>/dev/null || true');
      console.log('✅ health_server.js atualizado com suporte a upload de áudio OTA!');
    }
  } catch (e) {
    console.error('Erro ao verificar health_server:', e.message);
  }
}

function isWithinBusinessHoursBrazil() {
  try {
    const brHourStr = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: 'numeric',
      hour12: false
    }).format(new Date());
    const hour = parseInt(brHourStr, 10);
    return hour >= 8 && hour < 22;
  } catch (_) {
    return true;
  }
}

// -------------------------------------------------------------
// ENVIADOR HUMANIZADO: RESPOSTA EM ATÉ 2 BALÕES COM DIGITAÇÃO (3-5s)
// Simula comportamento 100% humano no WhatsApp e resolve Spintax anti-ban
// -------------------------------------------------------------
async function sendHumanizedBalloons(sock, toJid, rawText) {
  let resolved = resolveSpintax(rawText);
  const hasAudioProva = resolved.includes('[SEND_AUDIO_PROVA]');
  resolved = resolved.replace(/\[SEND_AUDIO_PROVA\]/g, '').trim();

  const balloons = splitIntoWhatsAppBalloons(resolved);

  if (balloons.length <= 1) {
    // 1 Balão curto: digitação dinâmica de 3.0s a 4.5s
    await sock.sendPresenceUpdate('composing', toJid);
    const delay = Math.floor(Math.random() * 1500) + 3000;
    console.log(`⏳ Simulando digitação por ${(delay / 1000).toFixed(1)}s (1 balão)...`);
    await new Promise(r => setTimeout(r, delay));
    await sock.sendMessage(toJid, { text: balloons[0] || resolved });
    await sock.sendPresenceUpdate('paused', toJid);

    if (hasAudioProva) {
      const audioPath = path.join(__dirname, 'audio_prova_social.mp3');
      if (fs.existsSync(audioPath)) {
        console.log(`🎙️ [ÁUDIO PROVA ELEVENLABS] Enviando áudio de prova social para ${toJid}...`);
        await sock.sendPresenceUpdate('recording', toJid);
        await new Promise(r => setTimeout(r, 1500));
        await sock.sendMessage(toJid, {
          audio: fs.readFileSync(audioPath),
          mimetype: 'audio/mp4',
          ptt: true,
          contextInfo: { isForwarded: true, forwardingScore: 1 }
        });
        await sock.sendPresenceUpdate('paused', toJid);
      }
    }
  } else {
    // 2 Balões Fracionados (WhatsApp 100% natural):
    // Balão 1: saudação/reação rápida com digitação de 1.8s a 2.5s
    console.log(`💬 [Balão 1/2]: "${balloons[0]}"`);
    await sock.sendPresenceUpdate('composing', toJid);
    const delay1 = Math.floor(Math.random() * 700) + 1800;
    await new Promise(r => setTimeout(r, delay1));
    await sock.sendMessage(toJid, { text: balloons[0] });
    await sock.sendPresenceUpdate('paused', toJid);

    // Se tiver áudio de prova social, envia no meio como áudio encaminhado
    if (hasAudioProva) {
      const audioPath = path.join(__dirname, 'audio_prova_social.mp3');
      if (fs.existsSync(audioPath)) {
        console.log(`🎙️ [ÁUDIO PROVA ELEVENLABS] Enviando áudio de prova social para ${toJid}...`);
        await sock.sendPresenceUpdate('recording', toJid);
        await new Promise(r => setTimeout(r, 1500));
        await sock.sendMessage(toJid, {
          audio: fs.readFileSync(audioPath),
          mimetype: 'audio/mp4',
          ptt: true,
          contextInfo: { isForwarded: true, forwardingScore: 1 }
        });
        await sock.sendPresenceUpdate('paused', toJid);
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    // Pausa natural de leitura/respiro entre 1.2s e 1.8s
    const pauseBetween = Math.floor(Math.random() * 600) + 1200;
    await new Promise(r => setTimeout(r, pauseBetween));

    // Balão 2: resposta principal com digitação de 2.5s a 4.0s
    console.log(`💬 [Balão 2/2]: "${balloons[1]}"`);
    await sock.sendPresenceUpdate('composing', toJid);
    const delay2 = Math.floor(Math.random() * 1500) + 2500;
    await new Promise(r => setTimeout(r, delay2));
    await sock.sendMessage(toJid, { text: balloons[1] });
    await sock.sendPresenceUpdate('paused', toJid);
  }

  return balloons;
}

// Processador da fila de eventos da Cakto (Recuperação de PIX e Boas-Vindas)
async function processCaktoQueue() {
  if (!activeSock) return;
  if (!fs.existsSync(CAKTO_QUEUE_FILE)) return;

  let queue = [];
  try {
    const raw = fs.readFileSync(CAKTO_QUEUE_FILE, 'utf-8');
    queue = JSON.parse(raw);
  } catch (_) {
    return;
  }

  if (!Array.isArray(queue) || queue.length === 0) return;

  const pending = queue.filter(item => !item.processed);
  if (pending.length === 0) return;

  for (const item of pending) {
    item.processed = true;
    item.processedAt = Date.now();

    const formattedPhone = formatBrazilWhatsAppPhone(item.customerPhone);
    console.log(`\n📦 [WEBHOOK CAKTO] Evento=${item.eventType} | Cliente=${item.customerName} | Fone=${formattedPhone || 'N/A'}`);

    if (formattedPhone) {
      const targetJid = `${formattedPhone}@s.whatsapp.net`;
      try {
        const onWa = await activeSock.onWhatsApp(formattedPhone);
        const contactExists = onWa && onWa.some(c => c.exists);

        if (contactExists) {
          if (item.eventType === 'quiz_completed') {
            const quizMsg = buildQuizLeadOutreachMessage(item);
            await sendHumanizedBalloons(activeSock, targetJid, quizMsg);
            console.log(`🎯 [QUIZ LEAD DISPATCH] Mensagem do Quiz enviada para ${targetJid}`);

            // Adicionar ao follow-up do Jarvis
            if (!leadsFollowUp[targetJid]) {
              leadsFollowUp[targetJid] = {
                jid: targetJid,
                phone: formattedPhone,
                senderName: item.customerName || 'Cliente Quiz',
                lastUserMessage: `[Iniciou pelo Quiz - Nota: ${item.score || 0}, Gargalo: ${item.bottleneck || 'N/A'}]`,
                lastInteractionAt: Date.now(),
                stage: 0,
                sentCheckoutLink: false,
                converted: false,
                source: 'quiz_lead'
              };
              saveFollowUps(leadsFollowUp);
            }
          } else if (item.eventType === 'purchase_approved' || item.eventType === 'approved' || item.eventType === 'paid') {
            const welcomeMsg = buildCaktoApprovedWelcomeMessage(item);
            await sendHumanizedBalloons(activeSock, targetJid, welcomeMsg);
            console.log(`🎉 [BOAS-VINDAS CAKTO] Mensagem enviada para ${targetJid}`);
          } else {
            const recoveryMsg = buildCaktoPixRecoveryMessage(item);
            await sendHumanizedBalloons(activeSock, targetJid, recoveryMsg);
            console.log(`⚡ [RECUPERAÇÃO PIX CAKTO] Mensagem enviada para ${targetJid}`);

            if (item.pixCode && item.pixCode.length > 20) {
              await new Promise(r => setTimeout(r, 1200));
              await activeSock.sendMessage(targetJid, { text: item.pixCode });
            }
          }
        } else {
          console.log(`⚠️ Telefone ${formattedPhone} não encontrado no WhatsApp`);
        }
      } catch (err) {
        console.error(`Erro ao disparar mensagem para ${formattedPhone}:`, err.message);
      }
    }

    // Notificar o Dono no WhatsApp
    if (resolvedOwnerJid) {
      try {
        if (item.eventType === 'quiz_completed') {
          const alertText = `🎯 *NOVO LEAD DO QUIZ CONTATADO PELO JARVIS*\n\n` +
            `👤 *Nome:* ${item.customerName || 'Sem nome'}\n` +
            `📱 *WhatsApp:* https://wa.me/${formattedPhone || ''}\n` +
            `📊 *Nota:* ${item.score || 0}/100 (${item.profile || 'Iniciante'})\n` +
            `🚧 *Gargalo:* ${item.bottleneck || 'Não informado'}\n\n` +
            `⚡ *Jarvis já iniciou a abordagem no privado!*`;
          await activeSock.sendMessage(resolvedOwnerJid, { text: alertText });
        } else {
          const isApproved = item.eventType === 'purchase_approved' || item.eventType === 'approved' || item.eventType === 'paid';
          const title = isApproved ? '💰 *NOVA VENDA APROVADA NA CAKTO!*' : '🔔 *PIX GERADO NA CAKTO (AGUARDANDO PAGAMENTO)*';
          const actionNote = isApproved
            ? '🎉 *Instruções de ativação com o Gmail já foram enviadas para o cliente!*'
            : '⚡ *Jarvis já chamou o cliente no WhatsApp para tirar dúvidas e recuperar a venda!*';

          const alertText = `${title}\n\n👤 *Nome:* ${item.customerName || 'Cliente'}\n📱 *WhatsApp:* https://wa.me/${formattedPhone || 'sem-fone'}\n📧 *Gmail:* ${item.customerEmail || 'não informado'}\n💰 *Valor:* R$ ${Number(item.amount || 0).toFixed(2)}\n👑 *Plano:* ${item.plan || 'SaaS'}\n\n${actionNote}`;
          await activeSock.sendMessage(resolvedOwnerJid, { text: alertText });
        }
      } catch (err) {
        console.error('Erro ao notificar dono sobre evento:', err.message);
      }
    }
  }

  // Manter os últimos 50 eventos para histórico
  try {
    fs.writeFileSync(CAKTO_QUEUE_FILE, JSON.stringify(queue.slice(-50), null, 2), 'utf-8');
  } catch (_) {}
}

async function processFollowUpQueue() {
  if (!activeSock) return;
  const now = Date.now();
  let changed = false;

  for (const [jid, lead] of Object.entries(leadsFollowUp)) {
    if (!lead || lead.converted || lead.stage >= 3) continue;
    if (resolvedOwnerJid && jid === resolvedOwnerJid) continue;

    // Se o chat estiver pausado manualmente, NÃO enviar mensagem de follow-up!
    const leadPhone = lead.phone || jid.replace('@s.whatsapp.net', '').replace('@lid', '');
    if (isChatPaused(leadPhone, jid)) {
      continue;
    }

    const elapsed = now - (lead.lastInteractionAt || now);

    // Estágio 1: 25 minutos sem resposta
    if (lead.stage === 0 && elapsed >= FOLLOWUP_STAGE1_MS) {
      const msgText = buildFollowUpMessage(lead, 1);
      if (msgText) {
        try {
          await sendHumanizedBalloons(activeSock, jid, msgText);
          lead.stage = 1;
          lead.stage1SentAt = now;
          changed = true;
          console.log(`⏰ [FOLLOW-UP 25 MIN] Enviado para ${lead.senderName} (${jid})`);
        } catch (err) {
          console.error(`Erro no Follow-up 25m para ${jid}:`, err.message);
        }
      }
    }
    // Estágio 2: 18 horas sem resposta (respeitando janela 08h-22h)
    else if (lead.stage === 1 && elapsed >= FOLLOWUP_STAGE2_MS && isWithinBusinessHoursBrazil()) {
      const msgText = buildFollowUpMessage(lead, 2);
      if (msgText) {
        try {
          await sendHumanizedBalloons(activeSock, jid, msgText);
          lead.stage = 2;
          lead.stage2SentAt = now;
          changed = true;
          console.log(`⏰ [FOLLOW-UP 18H] Enviado para ${lead.senderName} (${jid})`);
        } catch (err) {
          console.error(`Erro no Follow-up 18h para ${jid}:`, err.message);
        }
      }
    }
    // Estágio 3: 24 horas adicionais sem resposta - Gatilho de Cupom Relâmpago R$ 10 OFF
    else if (lead.stage === 2 && elapsed >= FOLLOWUP_STAGE3_MS && isWithinBusinessHoursBrazil()) {
      const msgText = buildFollowUpMessage(lead, 3);
      if (msgText) {
        try {
          await sendHumanizedBalloons(activeSock, jid, msgText);
          lead.stage = 3;
          lead.stage3SentAt = now;
          changed = true;
          console.log(`⏰ [FOLLOW-UP 24H CUPOM] Enviado para ${lead.senderName} (${jid})`);
        } catch (err) {
          console.error(`Erro no Follow-up Cupom para ${jid}:`, err.message);
        }
      }
    }
  }

  if (changed) {
    saveFollowUps(leadsFollowUp);
  }
}

function extractMessageText(messageObj) {
  if (!messageObj) return '';
  const inner =
    messageObj.ephemeralMessage?.message ||
    messageObj.viewOnceMessage?.message ||
    messageObj.viewOnceMessageV2?.message ||
    messageObj.documentWithCaptionMessage?.message ||
    messageObj.editedMessage?.message ||
    messageObj.deviceSentMessage?.message ||
    messageObj;

  return (
    inner.conversation ||
    inner.extendedTextMessage?.text ||
    inner.imageMessage?.caption ||
    inner.videoMessage?.caption ||
    inner.buttonsResponseMessage?.selectedDisplayText ||
    inner.listResponseMessage?.title ||
    inner.templateButtonReplyMessage?.selectedDisplayText ||
    ''
  );
}

let isSyncingQuiz = false;
let quizSyncInterval = null;

async function syncQuizLeadsFromVercel() {
  if (isSyncingQuiz || !activeSock) return;
  isSyncingQuiz = true;
  try {
    const res = await fetch('https://ghostmarket-ai.vercel.app/api/quiz-lead?action=sync');
    if (res.ok) {
      const data = await res.json();
      if (data.dispatchedCount > 0) {
        console.log(`🎯 [QUIZ SYNC] ${data.dispatchedCount} lead(s) pendente(s) do Quiz foram sincronizados com sucesso.`);
      }
    }
  } catch (e) {
    // Silencioso em caso de timeout
  } finally {
    isSyncingQuiz = false;
  }
}

async function startGhostWhatsAppAgent() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (activeSock) {
    try {
      activeSock.ev.removeAllListeners();
      activeSock.end(undefined);
    } catch (_) {}
    activeSock = null;
  }

  ensureHealthServerCaktoEndpoint();

  if (!followUpInterval) {
    followUpInterval = setInterval(() => {
      processFollowUpQueue().catch(e => console.error('Erro loop follow-up:', e.message));
    }, 60 * 1000);
  }

  if (!caktoInterval) {
    caktoInterval = setInterval(() => {
      processCaktoQueue().catch(e => console.error('Erro loop cakto queue:', e.message));
    }, 3500);
  }

  if (!quizSyncInterval) {
    quizSyncInterval = setInterval(() => {
      syncQuizLeadsFromVercel().catch(e => console.error('Erro loop quiz sync:', e.message));
    }, 2 * 60 * 1000); // Sincroniza a cada 2 minutos
  }

  if (!watchdogInterval) {
    watchdogInterval = setInterval(() => {
      checkScheduledReportsAndWatchdog();
    }, 60 * 1000);
  }

  console.log('\n==================================================');
  console.log(`🤖 INICIANDO JARVIS V3 (FUNIL HUMANO + CONTROLE MANUAL PAUSA) (PID: ${process.pid})...`);
  console.log('==================================================\n');

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

  if (state.creds?.me && !state.creds.me.name) {
    state.creds.me.name = 'Jarvis - GhostMarket';
    await saveCreds();
  }

  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`📡 Usando versão do WhatsApp Web: v${version.join('.')} (Última: ${isLatest})`);

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'warn' }),
    printQRInTerminal: false,
    auth: state,
    browser: ['GhostMarket AI', 'Chrome', '1.0.0'],
    markOnlineOnConnect: true
  });

  activeSock = sock;

  sock.ev.on('creds.update', async () => {
    if (state.creds?.me && !state.creds.me.name) {
      state.creds.me.name = 'Jarvis - GhostMarket';
    }
    await saveCreds();
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📲 QR CODE GERADO COM SUCESSO!');
      console.log('👉 Escaneie pelo WhatsApp no seu celular (Dispositivos Conectados):\n');
      qrcodeTerminal.generate(qr, { small: true });

      try {
        const qrDataUrl = await QRCode.toDataURL(qr, { width: 380, margin: 2 });
        const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Conectar WhatsApp - GhostMarket AI</title>
  <meta http-equiv="refresh" content="20">
  <style>
    body { background: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: #1e293b; padding: 32px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: center; max-width: 440px; border: 1px solid #334155; }
    h1 { margin-top: 0; font-size: 22px; color: #38bdf8; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
    .qr-box { background: white; padding: 16px; border-radius: 12px; display: inline-block; margin: 20px 0; }
    .qr-box img { display: block; max-width: 100%; height: auto; }
    .badge { display: inline-block; background: #10b981; color: #022c22; font-weight: bold; padding: 6px 14px; border-radius: 999px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">SISTEMA ONLINE</div>
    <h1>Conectar WhatsApp do Atendente</h1>
    <p>Abra o WhatsApp no seu celular &gt; <strong>Aparelhos conectados</strong> &gt; <strong>Conectar um aparelho</strong> e aponte para o código:</p>
    <div class="qr-box">
      <img src="${qrDataUrl}" alt="QR Code WhatsApp" />
    </div>
  </div>
</body>
</html>`;
        fs.writeFileSync(QR_HTML_PATH, htmlContent, 'utf-8');
      } catch (e) {
        console.error('Erro ao gerar HTML do QR code:', e);
      }
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`\n⚠️ Conexão encerrada (Status: ${statusCode}). Reconectando? ${shouldReconnect}`);
      if (shouldReconnect && !reconnectTimer) {
        const waitMs = statusCode === 440 ? 6000 : 3000;
        reconnectTimer = setTimeout(startGhostWhatsAppAgent, waitMs);
      } else if (!shouldReconnect) {
        console.log('❌ Sessão desconectada manualmente. Apague a pasta auth_info para reiniciar.');
      }
    } else if (connection === 'open') {
      if (state.creds?.me && !state.creds.me.name) {
        state.creds.me.name = 'Jarvis - GhostMarket';
        await saveCreds();
      }
      try {
        await sock.sendPresenceUpdate('available');
      } catch (_) {}

      console.log('\n======================================================');
      console.log('🎉 GHOSTMARKET WHATSAPP AGENT V3 ONLINE E CONECTADO!');
      console.log(`📱 Conta conectada: ${JSON.stringify(state.creds?.me || {})}`);
      console.log('💰 Recuperador de PIX Cakto + Funil Humano + Controle de Pausa ATIVOS!');
      console.log('======================================================\n');

      try {
        const checkResults = await sock.onWhatsApp('5584996656016', '558496656016');
        const found = checkResults.find(r => r.exists);
        if (found) {
          resolvedOwnerJid = found.jid;
          console.log(`🔔 Notificações de Lead Quente e Vendas ativadas para: ${resolvedOwnerJid}`);
        } else {
          resolvedOwnerJid = '5584996656016@s.whatsapp.net';
          console.log(`🔔 Notificações padrão configuradas para: ${resolvedOwnerJid}`);
        }
      } catch (err) {
        resolvedOwnerJid = '5584996656016@s.whatsapp.net';
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    for (const msg of messages) {
      const from = msg.key?.remoteJid;
      if (!from || from === 'status@broadcast') continue;

      if (msg.key?.fromMe) continue;

      const isGroup = from.endsWith('@g.us');
      const isBroadcast = from.includes('@broadcast') || from.endsWith('@newsletter');
      if (isGroup || isBroadcast) continue;

      const senderName = msg.pushName || 'Cliente';
      const cleanPhone = from.replace('@s.whatsapp.net', '').replace('@lid', '');

      // 0. VERIFICAÇÃO DE PAUSA MANUAL (HUMAN TAKEOVER):
      if (isChatPaused(cleanPhone, from)) {
        console.log(`⏸️ [CHAT PAUSADO] Mensagem de +${cleanPhone} recebida, mas IA está pausada para atendimento manual.`);
        continue;
      }

      const inner =
        msg.message?.ephemeralMessage?.message ||
        msg.message?.viewOnceMessage?.message ||
        msg.message?.viewOnceMessageV2?.message ||
        msg.message?.documentWithCaptionMessage?.message ||
        msg.message?.editedMessage?.message ||
        msg.message?.deviceSentMessage?.message ||
        msg.message;

      const isAudio = Boolean(inner?.audioMessage);
      const isImage = Boolean(inner?.imageMessage);
      let text = extractMessageText(msg.message);

      // Ouvido de IA: Transcrição com Groq Whisper para áudios recebidos
      if (isAudio) {
        console.log(`🎙️ [ÁUDIO RECEBIDO] Baixando e transcrevendo áudio de ${senderName} (+${cleanPhone})...`);
        try {
          const audioBuffer = await downloadMediaMessage(
            msg,
            'buffer',
            {},
            { logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage }
          );
          if (audioBuffer && audioBuffer.length > 0) {
            const transcribed = await transcribeAudioWithWhisper(audioBuffer);
            if (transcribed && transcribed.trim()) {
              text = transcribed.trim();
              console.log(`🎙️ [TRANSCRIÇÃO WHISPER]: "${text}"`);
            } else {
              console.log('⚠️ Áudio sem fala identificada ou ruído.');
              await sendHumanizedBalloons(sock, from, resolveSpintax("{Opa|Fala parceiro}, não consegui ouvir o que você falou no áudio.[SPLIT]Consegue me mandar em texto rapidinho qual tipo de comércio você pensa em atender?"));
              continue;
            }
          }
        } catch (audioErr) {
          console.error('Erro ao baixar/transcrever áudio:', audioErr.message);
          await sendHumanizedBalloons(sock, from, resolveSpintax("{Opa|Fala parceiro}, deu um errinho pra carregar seu áudio aqui.[SPLIT]Consegue me mandar por mensagem de texto, por favor?"));
          continue;
        }
      }

      // Visão Computacional: OCR de Prints de Comprovante de Pagamento PIX / Cakto
      if (isImage) {
        console.log(`📸 [IMAGEM RECEBIDA] Baixando e analisando print/imagem de ${senderName} (+${cleanPhone})...`);
        try {
          const imageBuffer = await downloadMediaMessage(
            msg,
            'buffer',
            {},
            { logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage }
          );

          if (imageBuffer && imageBuffer.length > 0) {
            const ocrText = await extractTextFromImage(imageBuffer);
            console.log(`📸 [OCR DETECTADO]: "${(ocrText || '').replace(/\s+/g, ' ').slice(0, 150)}..."`);

            const isReceipt = /(comprovante|pix|pagamento|transfer[eê]ncia|cakto|ghostmarket|r\$|efetuado|conclu[ií]do|banco|autentica[çc][ãa]o)/i.test(ocrText || '');

            if (isReceipt) {
              const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
              const emailMatch = (ocrText || '').match(emailRegex);
              const receiptEmail = emailMatch ? emailMatch[1].toLowerCase().trim() : null;

              // Notificar Dono no WhatsApp imediatamente
              if (resolvedOwnerJid && from !== resolvedOwnerJid) {
                try {
                  await sock.sendMessage(resolvedOwnerJid, {
                    text: `💰 *COMPROVANTE DE PAGAMENTO RECEBIDO PELO JARVIS!*\n\n👤 *Cliente:* ${senderName}\n📱 *WhatsApp:* https://wa.me/${cleanPhone}\n📧 *E-mail identificado:* ${receiptEmail || 'Não visível no print'}\n\n🧾 *Texto do comprovante:*\n"${(ocrText || '').slice(0, 250)}..."`
                  });
                } catch (_) {}
              }

              if (receiptEmail) {
                const verification = await verifyCustomerPurchase({ email: receiptEmail, phone: cleanPhone });
                if (verification?.verified) {
                  const reply = resolveSpintax(`{Show de bola|Sensacional|Perfeito}, ${senderName}! Analisei seu comprovante do PIX e localizei seu acesso aprovado no sistema com sucesso![SPLIT]Pra começar a usar agora é só acessar:\n👉 https://ghostmarket-ai.vercel.app\n\nEntra e cria a sua conta usando esse mesmo Gmail (*${receiptEmail}*). O sistema já reconhece sua compra na hora e libera o gerador de sites com IA e o Radar de clientes sem travas!\n\nVocê precisa de alguma ajuda ou orientação pra fechar o seu primeiro cliente?`);
                  await sendHumanizedBalloons(sock, from, reply);
                } else {
                  const reply = resolveSpintax(`{Show de bola|Sensacional}, recebi seu comprovante do PIX aqui![SPLIT]Assim que a Cakto processar a compensação (costuma levar 1 a 2 minutinhos), seu acesso libera automático no Gmail *${receiptEmail}*.\n\nJá pode ir criando sua conta no link oficial: https://ghostmarket-ai.vercel.app com esse mesmo Gmail!`);
                  await sendHumanizedBalloons(sock, from, reply);
                }
              } else {
                const reply = resolveSpintax(`{Show de bola|Sensacional}, recebi seu comprovante do PIX aqui![SPLIT]Me passa aqui o seu *Gmail* que você usou na compra da Cakto, que eu já consulto o seu acesso no sistema agora pra confirmar e te orientar.`);
                await sendHumanizedBalloons(sock, from, reply);
              }

              // Marcar lead como convertido
              leadsFollowUp[from] = {
                jid: from,
                phone: cleanPhone,
                senderName,
                lastUserMessage: '[Comprovante de Pagamento PIX Enviado]',
                lastInteractionAt: Date.now(),
                stage: 0,
                sentCheckoutLink: true,
                converted: true
              };
              saveFollowUps(leadsFollowUp);
              continue;
            } else if (ocrText) {
              text = text ? `${text}\n[Texto da imagem enviada pelo cliente: "${ocrText}"]` : `[O cliente enviou um print com o seguinte texto: "${ocrText}"]`;
            }
          }
        } catch (imgErr) {
          console.error('Erro ao processar imagem:', imgErr.message);
        }
      }

      if (!text || text.trim().length === 0) continue;

      console.log(`📩 [${new Date().toLocaleTimeString('pt-BR')}] Mensagem de ${senderName} (+${cleanPhone}):`);
      console.log(`💬 "${text}"`);

      // Comandos Administrativos (Exclusivos do Dono ou acionados por !)
      const cleanLower = text.trim().toLowerCase();
      if (cleanLower.startsWith('!')) {
        // 1. Comando de Pausar Chat Manualmente
        if (cleanLower.startsWith('!pausar') || cleanLower.startsWith('!pause')) {
          const target = text.replace(/^!(pausar|pause)\s*/i, '').trim();
          if (!target) {
            await sock.sendMessage(from, { text: 'Uso: !pausar 84999999999 (informe o número para pausar a IA nesta conversa)' });
            continue;
          }
          const clean = formatBrazilWhatsAppPhone(target) || target.replace(/\D/g, '');
          setChatPaused(clean, true, 'Comando WhatsApp');
          await sock.sendMessage(from, { text: `⏸️ Chat com +${clean} foi PAUSADO com sucesso!\nA IA não vai mais responder automaticamente até você enviar:\n!reativar ${clean}` });
          continue;
        }

        // 2. Comando de Reativar Chat
        if (cleanLower.startsWith('!reativar') || cleanLower.startsWith('!despausar') || cleanLower.startsWith('!unpause')) {
          const target = text.replace(/^!(reativar|despausar|unpause)\s*/i, '').trim();
          if (!target) {
            await sock.sendMessage(from, { text: 'Uso: !reativar 84999999999 (reativa o atendimento automático da IA)' });
            continue;
          }
          const clean = formatBrazilWhatsAppPhone(target) || target.replace(/\D/g, '');
          setChatPaused(clean, false);
          await sock.sendMessage(from, { text: `▶️ Chat com +${clean} foi REATIVADO com sucesso!\nA IA voltou a atender e responder mensagens normalmente.` });
          continue;
        }

        // 3. Listar Chats Pausados
        if (cleanLower === '!pausados' || cleanLower === '!pausas') {
          const list = Object.keys(pausedChatsCache);
          if (list.length === 0) {
            await sock.sendMessage(from, { text: 'Nenhum chat está pausado no momento. A IA está ativa para todos os contatos.' });
          } else {
            const lines = list.map(num => `- +${num} (${pausedChatsCache[num]?.reason || 'Manual'})`).join('\n');
            await sock.sendMessage(from, { text: `⏸️ *CHATS PAUSADOS (ATENDIMENTO MANUAL):*\n\n${lines}\n\nPara reativar qualquer um, envie:\n!reativar [numero]` });
          }
          continue;
        }

        if (cleanLower === '!cfo' || cleanLower === '!vendas' || cleanLower === '!financeiro') {
          const report = generateCfoReport('💰 *RESUMO FINANCEIRO SOLICITADO (CFO)*');
          await sock.sendMessage(from, { text: report });
          continue;
        }

        if (cleanLower === '!bateria' || cleanLower === '!saude' || cleanLower === '!uptime') {
          const batt = getBatteryInfo();
          const battText = batt.percent !== null ? `${batt.percent}% (${batt.status})` : 'Alimentado via USB / Carregador';
          const freeRamMb = Math.round(os.freemem() / 1024 / 1024);
          const totalRamMb = Math.round(os.totalmem() / 1024 / 1024);
          const uptimeHours = (process.uptime() / 3600).toFixed(1);
          await sock.sendMessage(from, {
            text: `🔋 *SAÚDE DO MOTO G60 (SENTINELA)*\n\n- ⚡ *Bateria:* ${battText}\n- 🧠 *RAM:* ${freeRamMb} MB livres de ${totalRamMb} MB\n- ⏰ *Uptime:* ${uptimeHours} horas ininterruptas\n- 🌐 *Túnel Cloudflare:* Operacional\n- 🤖 *Jarvis:* Ativo e atendendo 24/7`
          });
          continue;
        }

        if (cleanLower.startsWith('!analise') || cleanLower.startsWith('!retencao') || cleanLower.startsWith('!tiktok')) {
          const param = text.replace(/^!([a-zA-Z]+)\s*/i, '').trim();
          if (!param) {
            await sock.sendMessage(from, {
              text: `📊 *AUDITOR DE RETENÇÃO TIKTOK*\n\nComo usar:\nEnvie: *!analise [dados do seu vídeo]*\n\n*Exemplo:*\n👉 *!analise Barbearia: 50k views, 42% nos primeiros 3s, tempo médio 19s*\n\nOu envie qualquer resumo com os números do seu Analytics e eu analiso o ponto de evasão e dou 3 regras corretivas para o próximo vídeo!`
            });
            continue;
          }

          await sock.sendPresenceUpdate('composing', from);
          const analysis = await analyzeTikTokMetrics(param);
          await sock.sendMessage(from, { text: analysis });
          await sock.sendPresenceUpdate('paused', from);
          continue;
        }

        if (cleanLower === '!leads' || cleanLower === '!status' || cleanLower === '!painel') {
          const allLeads = Object.values(leadsFollowUp);
          const activeCount = allLeads.filter(l => !l.converted && l.stage < 2).length;
          const withLinkCount = allLeads.filter(l => l.sentCheckoutLink).length;
          const convertedCount = allLeads.filter(l => l.converted).length;
          const pausedCount = Object.keys(pausedChatsCache).length;
          await sock.sendMessage(from, {
            text: `🤖 *PAINEL JARVIS V3 (MOTO G60)*\n\n- 👥 *Total de Leads atendidos:* ${allLeads.length}\n- 🔥 *Receberam link da Cakto:* ${withLinkCount}\n- ⏰ *Em fila de Follow-up (25m / 18h):* ${activeCount}\n- ⏸️ *Chats Pausados (Manual):* ${pausedCount}\n- 💰 *Confirmaram pagamento:* ${convertedCount}\n- ⚡ *Recuperação Cakto:* Ativa\n- 🟢 *Status:* Online 24/7`
          });
          continue;
        }

        if (cleanLower === '!menu' || cleanLower === '!ajuda') {
          await sock.sendMessage(from, {
            text: `🛠️ *COMANDOS DISPONÍVEIS DO JARVIS:*\n\n- *!pausar [numero]* ➔ Pausa a IA para atendimento humano no número\n- *!reativar [numero]* ➔ Reativa o bot na conversa\n- *!pausados* ➔ Lista todos os números pausados\n- *!cfo* ou *!vendas* ➔ Faturamento de hoje, vendas e conversão de PIX\n- *!bateria* ou *!saude* ➔ Bateria real, RAM e uptime do Moto G60\n- *!analise [dados]* ➔ Auditor de retenção do TikTok\n- *!leads* ou *!status* ➔ Visão rápida do funil de vendas\n\n🔔 *Rotinas Automáticas:*\n- Relatório CFO diário às 09:00 e 21:00\n- Alerta imediato se bateria cair para <= 20%`
          });
          continue;
        }
      }

      // 0. VERIFICAÇÃO DE PAUSA MANUAL (HUMAN TAKEOVER):
      // Se este número estiver pausado, NUNCA responder automaticamente!
      if (isChatPaused(cleanPhone, from)) {
        console.log(`⏸️ [CHAT PAUSADO] Mensagem de +${cleanPhone} recebida, mas IA está pausada para atendimento manual.`);
        continue;
      }

      // 1. Verificar se o lead confirmou que já pagou
      const paidRegex = /(ja paguei|já paguei|comprei|acabei de pagar|paguei o pix|já assinei|ja assinei|fiz o pagamento|pagamento aprovado)/i;
      const hasPaid = paidRegex.test(text);

      // 2. Identificar se é Lead Quente
      const hotLeadRegex = /(pix|pagar|pagamento|assinar|cartao|cartão|boleto|comprar|fechar|humano|atendente|falar com alguem|falar com o dono|link de pagamento|vitalicio|vitalício|mensal)/i;
      const isHotLead = hotLeadRegex.test(text) || hasPaid;

      if (isHotLead && resolvedOwnerJid && from !== resolvedOwnerJid) {
        try {
          const alertTitle = hasPaid ? '💰 *CLIENTE CONFIRMOU PAGAMENTO NO WHATSAPP!*' : '🚨 *NOVO LEAD QUENTE NO GHOSTMARKET!*';
          const alertMessage = `${alertTitle}\n\n👤 *Nome:* ${senderName}\n📱 *WhatsApp do Lead:* https://wa.me/${cleanPhone}\n💬 *Mensagem do Lead:*\n"${text}"\n\n👉 *Jarvis já está respondendo em tempo real!*`;
          await sock.sendMessage(resolvedOwnerJid, { text: alertMessage });
          console.log(`🚨 Notificação de Lead Quente disparada com sucesso!`);
        } catch (err) {
          console.error('Erro ao enviar notificação de lead quente:', err.message);
        }
      }

      // 3. Responder o cliente seguindo o funil de vendas sem flood de emojis
      try {
        console.log('🧠 Jarvis pensando na resposta de conversão...');
        const aiReply = await getAiResponse(from, text, { cleanPhone, senderName, jid: from });

        // Envio fracionado em até 2 balões com digitação humana dinâmica (3-5s total) e Spintax anti-ban
        const sentBalloons = await sendHumanizedBalloons(sock, from, aiReply);
        const fullReply = sentBalloons.join('\n\n');

        console.log(`🤖 [Jarvis respondeu com sucesso em ${sentBalloons.length} balão(ões)]\n`);

        // 4. Atualizar estado do Follow-up Automático
        const existingLead = leadsFollowUp[from] || {};
        const replyHasCheckout = fullReply.includes('pay.cakto.com.br');
        const isConfirmedApproved = fullReply.includes('Encontrei aqui seu acesso aprovado');

        leadsFollowUp[from] = {
          jid: from,
          phone: cleanPhone,
          senderName,
          lastUserMessage: text,
          lastInteractionAt: Date.now(),
          stage: 0,
          sentCheckoutLink: Boolean(existingLead.sentCheckoutLink || replyHasCheckout),
          converted: Boolean(existingLead.converted || hasPaid || isConfirmedApproved)
        };
        saveFollowUps(leadsFollowUp);

        if (isConfirmedApproved && resolvedOwnerJid && from !== resolvedOwnerJid) {
          try {
            await sock.sendMessage(resolvedOwnerJid, {
              text: `✅ *CLIENTE ATIVADO VIA GMAIL PELO JARVIS!*\n\n👤 *Nome:* ${senderName}\n📱 *WhatsApp:* https://wa.me/${cleanPhone}\n🎉 *Status:* Acesso validado no sistema e onboarding entregue!`
            });
          } catch (_) {}
        }
      } catch (err) {
        console.error('❌ Erro ao responder cliente no WhatsApp:', err.message);
      }
    }
  });
}

startGhostWhatsAppAgent().catch(err => {
  console.error('Erro fatal ao iniciar agente:', err);
});
