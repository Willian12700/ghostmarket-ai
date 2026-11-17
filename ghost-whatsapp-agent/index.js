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
  buildCaktoPostPurchaseAffiliateInvite,
  buildQuizLeadOutreachMessage,
  analyzeTikTokMetrics,
  splitIntoWhatsAppBalloons,
  resolveSpintax,
  transcribeAudioWithWhisper,
  extractTextFromImage,
  verifyCustomerPurchase,
  extractPromisedPaymentDate,
  buildPromisedClosingMessage
} from './brain.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_FOLDER = path.join(__dirname, 'auth_info');
const QR_HTML_PATH = path.join(__dirname, 'scan_qr.html');
const LOCK_FILE = path.join(__dirname, 'agent.pid');
const FOLLOWUP_FILE = path.join(__dirname, 'leads_followup.json');
const CAKTO_QUEUE_FILE = path.join(__dirname, 'cakto_queue.json');
const PAUSED_CHATS_FILE = path.join(__dirname, 'paused_chats.json');
const SCHEDULED_PROMISES_FILE = path.join(__dirname, 'scheduled_promises.json');

// Prova Social em Áudio gerada com ElevenLabs
let AUDIO_PROVA_BASE64 = null;
try {
  const audioMod = await import('./audio_data.js');
  AUDIO_PROVA_BASE64 = audioMod.AUDIO_PROVA_BASE64;
} catch (_) {}

const audioProvaPath = path.join(__dirname, 'audio_prova_social.mp3');
if (!fs.existsSync(audioProvaPath) && AUDIO_PROVA_BASE64) {
  try {
    fs.writeFileSync(audioProvaPath, Buffer.from(AUDIO_PROVA_BASE64, 'base64'));
    console.log('✅ [Áudio Prova] Arquivo audio_prova_social.mp3 gerado a partir do audio_data.js!');
  } catch (e) {
    console.error('Erro ao escrever audio_prova_social.mp3:', e.message);
  }
}

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
export function loadPausedChats() {
  try {
    if (fs.existsSync(PAUSED_CHATS_FILE)) {
      return JSON.parse(fs.readFileSync(PAUSED_CHATS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Erro ao ler paused_chats.json:', e.message);
  }
  return {};
}

export function savePausedChats(data) {
  try {
    fs.writeFileSync(PAUSED_CHATS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Erro ao salvar paused_chats.json:', e.message);
  }
}

// Gestão de Promessas de Pagamento & Agenda Inteligente
export function loadPromises() {
  try {
    if (fs.existsSync(SCHEDULED_PROMISES_FILE)) {
      return JSON.parse(fs.readFileSync(SCHEDULED_PROMISES_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Erro ao ler scheduled_promises.json:', e.message);
  }
  return {};
}

export function savePromises(data) {
  try {
    fs.writeFileSync(SCHEDULED_PROMISES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Erro ao salvar scheduled_promises.json:', e.message);
  }
}

async function syncPromiseToFirestore(promise) {
  try {
    if (!promise || !promise.id) return;
    const authRes = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDafvRbIgwriRgCis2sAmJeJ80RHmn30LA', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true })
    });
    const authData = await authRes.json();
    const idToken = authData.idToken;
    if (!idToken) return;

    const docFields = {
      fields: {
        id: { stringValue: promise.id },
        phone: { stringValue: promise.phone || '' },
        jid: { stringValue: promise.jid || '' },
        senderName: { stringValue: promise.senderName || '' },
        isoDate: { stringValue: promise.isoDate || '' },
        formatted: { stringValue: promise.formatted || '' },
        leadMessage: { stringValue: promise.leadMessage || '' },
        status: { stringValue: promise.status || 'pending' },
        offer: { stringValue: promise.offer || 'vitalicio' },
        createdAt: { integerValue: String(promise.createdAt || Date.now()) }
      }
    };
    if (promise.remindedAt) docFields.fields.remindedAt = { integerValue: String(promise.remindedAt) };
    if (promise.convertedAt) docFields.fields.convertedAt = { integerValue: String(promise.convertedAt) };

    await fetch(`https://firestore.googleapis.com/v1/projects/ghostmarket-ai-2cc26/databases/(default)/documents/scheduled_promises/${promise.id}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(docFields)
    });
  } catch (err) {
    console.warn('Erro ao sincronizar promessa com Firestore:', err.message);
  }
}

// Retorna todas as variações possíveis de um número de WhatsApp brasileiro (12 e 13 dígitos, com/sem 55, JID e últimos 8 dígitos)
export function getPhoneVariants(rawPhoneOrJid) {
  if (!rawPhoneOrJid) return [];
  const str = String(rawPhoneOrJid).trim();
  const digits = str.replace(/\D/g, '');
  const variants = new Set();

  if (str) variants.add(str.toLowerCase());
  if (digits) {
    variants.add(digits);
    variants.add(`${digits}@s.whatsapp.net`);
  }

  let ddd = '';
  let rest = '';

  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    ddd = digits.slice(2, 4);
    rest = digits.slice(4);
  } else if (!digits.startsWith('55') && (digits.length === 10 || digits.length === 11)) {
    ddd = digits.slice(0, 2);
    rest = digits.slice(2);
  }

  if (ddd && rest) {
    const with9 = rest.length === 9 ? rest : ('9' + rest);
    const without9 = rest.length === 9 ? rest.slice(1) : rest;

    variants.add(`55${ddd}${with9}`);
    variants.add(`55${ddd}${without9}`);
    variants.add(`${ddd}${with9}`);
    variants.add(`${ddd}${without9}`);
    variants.add(`55${ddd}${with9}@s.whatsapp.net`);
    variants.add(`55${ddd}${without9}@s.whatsapp.net`);
  }

  if (digits.length >= 8) {
    variants.add(digits.slice(-8));
  }

  return Array.from(variants);
}

// Identifica se um chat está pausado recarregando o disco em tempo real e checando todas as variações
export function isChatPaused(phone, jid) {
  const paused = loadPausedChats();
  const pausedKeys = Object.keys(paused);
  if (pausedKeys.length === 0) return false;

  const checkVariants = [
    ...getPhoneVariants(phone),
    ...getPhoneVariants(jid)
  ];

  for (const v of checkVariants) {
    if (!v) continue;
    if (paused[v] && paused[v].paused !== false) {
      return true;
    }
  }

  for (const pausedKey of pausedKeys) {
    const pData = paused[pausedKey];
    if (pData && pData.paused === false) continue;
    const pVariants = getPhoneVariants(pausedKey);
    for (const pv of pVariants) {
      if (checkVariants.includes(pv)) {
        return true;
      }
    }
    // Comparação por DDD + 8 últimos dígitos
    const cleanP = pausedKey.replace(/\D/g, '');
    const cleanCheck = (phone || jid || '').replace(/\D/g, '');
    if (cleanP.length >= 8 && cleanCheck.length >= 8 && cleanP.slice(-8) === cleanCheck.slice(-8)) {
      return true;
    }
  }

  return false;
}

export function setChatPaused(phoneOrJid, paused = true, reason = 'Atendimento Manual') {
  const pausedChats = loadPausedChats();
  const variants = getPhoneVariants(phoneOrJid);

  if (paused) {
    const entry = {
      phone: String(phoneOrJid),
      paused: true,
      pausedAt: Date.now(),
      reason
    };
    for (const v of variants) {
      pausedChats[v] = entry;
    }
  } else {
    for (const v of variants) {
      delete pausedChats[v];
    }
    const clean = String(phoneOrJid).replace(/\D/g, '');
    if (clean.length >= 8) {
      const suffix = clean.slice(-8);
      for (const k of Object.keys(pausedChats)) {
        if (k.endsWith(suffix)) {
          delete pausedChats[k];
        }
      }
    }
  }

  savePausedChats(pausedChats);
  return pausedChats;
}

// Rastreamento de mensagens enviadas pela IA para auto-pausar quando o humano digita no WhatsApp
const botSentMessageIds = new Set();
function recordBotMessageId(id) {
  if (!id) return;
  botSentMessageIds.add(id);
  if (botSentMessageIds.size > 1000) {
    const first = botSentMessageIds.values().next().value;
    botSentMessageIds.delete(first);
  }
}

async function sendBotMessage(sock, toJid, content) {
  const res = await sock.sendMessage(toJid, content);
  if (res?.key?.id) {
    recordBotMessageId(res.key.id);
  }
  return res;
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

// Busca todas as vendas aprovadas no Firestore (descartando testes de webhook e contas de testadores)
async function fetchFirestoreApprovedSales() {
  try {
    const res = await fetch('https://firestore.googleapis.com/v1/projects/ghostmarket-ai-2cc26/databases/(default)/documents/allowed_users?pageSize=300');
    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.documents || [];
    const validSales = [];

    for (const doc of docs) {
      const fields = doc.fields || {};
      const email = (fields.email?.stringValue || doc.name.split('/').pop() || '').toLowerCase().trim();
      const status = fields.status?.stringValue || 'approved';
      const plan = (fields.plan?.stringValue || '').toLowerCase().trim();
      const grantedAt = fields.grantedAt?.stringValue || doc.createTime;
      const registeredName = (fields.registeredName?.stringValue || fields.customerName?.stringValue || '').toLowerCase();
      const grossAmount = Number(fields.grossAmount?.doubleValue || fields.grossAmount?.integerValue || fields.amount?.doubleValue || fields.amount?.integerValue || 0);

      // -------------------------------------------------------------
      // DESCARTE RIGOROSO DE TESTES DE WEBHOOK E CONTAS GRATUITAS
      // -------------------------------------------------------------
      // 1. Ignorar planos vazios ou plano 'pro' (contas manuais de testadores grátis)
      if (!plan || plan === 'pro' || plan === 'sem-plano') continue;
      // 2. Ignorar testes com nomes John Doe / Jon Doe / Teste
      if (registeredName.includes('john doe') || registeredName.includes('jon doe') || registeredName.includes('teste')) continue;
      // 3. Ignorar e-mails de teste ou contas do próprio desenvolvedor/dono
      if (email.includes('example.com') || email.includes('teste') || email.includes('awdwad') || email.includes('willrandrier') || email.includes('randrierwill')) continue;
      // 4. Ignorar testes com valor de R$ 90 ou R$ 1
      if (grossAmount === 90 || grossAmount === 1) continue;

      const isVitalicio = plan === 'vitalicio' || plan === 'elite' || plan.includes('vital');
      const defaultGross = isVitalicio ? 49.99 : 19.99;
      const defaultDirectNet = isVitalicio ? 46.51 : 16.51;

      const isAffiliate = fields.isAffiliate?.booleanValue || false;
      const affiliateName = fields.affiliateName?.stringValue || '';
      const affiliateEmail = fields.affiliateEmail?.stringValue || '';
      const affiliateCommission = Number(fields.affiliateCommission?.doubleValue || fields.affiliateCommission?.integerValue || 0);

      const realGross = (grossAmount > 0 && grossAmount !== 90) ? grossAmount : defaultGross;

      let netAmount = Number(fields.netAmount?.doubleValue || fields.netAmount?.integerValue || 0);
      if (!netAmount) {
        netAmount = isAffiliate && affiliateCommission > 0 ? Math.max(0, defaultDirectNet - affiliateCommission) : defaultDirectNet;
      }

      validSales.push({
        email,
        status,
        plan,
        amount: realGross,
        netAmount,
        isAffiliate,
        affiliateName,
        affiliateEmail,
        affiliateCommission,
        grantedAt
      });
    }

    return validSales;
  } catch (err) {
    console.error('Erro ao buscar vendas no Firestore para o CFO:', err.message);
    return [];
  }
}

function getSpDateString(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
}

// Garante que a venda de hoje esteja salva localmente na fila com valores corretos (Bruto: R$ 19,99 | Líquido no Bolso: R$ 16,51)
function ensureGabrielSaleInQueue() {
  try {
    let queue = [];
    if (fs.existsSync(CAKTO_QUEUE_FILE)) {
      queue = JSON.parse(fs.readFileSync(CAKTO_QUEUE_FILE, 'utf-8'));
    }
    if (!Array.isArray(queue)) queue = [];
    const gabrielItem = {
      eventType: 'purchase_approved',
      customerName: 'Gabriel Santos de Oliveira',
      customerEmail: 'torresgemeas50@gmail.com',
      customerPhone: '5511993433367',
      amount: 19.99,
      netAmount: 16.51,
      plan: 'mensal',
      isAffiliate: false,
      affiliateName: '',
      affiliateEmail: '',
      affiliateCommission: 0,
      queuedAt: new Date('2026-11-16T18:25:47.583Z').getTime(),
      processed: true,
      processedAt: new Date('2026-11-16T18:25:47.583Z').getTime()
    };

    const idx = queue.findIndex(item => (item.customerEmail || '').toLowerCase() === 'torresgemeas50@gmail.com');
    if (idx >= 0) {
      queue[idx] = {
        ...queue[idx],
        customerName: 'Gabriel Santos de Oliveira',
        customerPhone: '5511993433367',
        amount: 19.99,
        netAmount: 16.51,
        plan: 'mensal'
      };
    } else {
      queue.push(gabrielItem);
    }
    fs.writeFileSync(CAKTO_QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao atualizar venda de Gabriel na fila:', err.message);
  }
}

// Gera o Relatório Executivo Completo de Vendas, Conversão, Lucro Líquido e Afiliados (CFO)
async function generateCfoReport(titleHeader = '📊 *RELATÓRIO EXECUTIVO GHOSTMARKET (CFO)*') {
  ensureGabrielSaleInQueue();

  let queue = [];
  try {
    if (fs.existsSync(CAKTO_QUEUE_FILE)) {
      queue = JSON.parse(fs.readFileSync(CAKTO_QUEUE_FILE, 'utf-8'));
    }
  } catch (_) {}
  if (!Array.isArray(queue)) queue = [];

  const firestoreSales = await fetchFirestoreApprovedSales();

  const allLeads = Object.values(leadsFollowUp);
  const leadsHoje = allLeads.filter(l => {
    if (!l.lastInteractionAt) return false;
    return getSpDateString(l.lastInteractionAt) === todaySp;
  }).length;
  const activeCount = allLeads.filter(l => !l.converted && l.stage < 2).length;
  const withLinkCount = allLeads.filter(l => l.sentCheckoutLink).length;

  const todaySp = getSpDateString(new Date());

  // 1. Unificar Vendas Aprovadas (Deduplicação Inteligente: Firestore + Cakto Queue)
  const approvedMap = new Map();

  for (const s of firestoreSales) {
    if (s.email) {
      approvedMap.set(s.email, {
        customerName: s.email.split('@')[0],
        customerEmail: s.email,
        amount: s.amount,
        netAmount: s.netAmount,
        plan: s.plan,
        isAffiliate: s.isAffiliate,
        affiliateName: s.affiliateName,
        affiliateEmail: s.affiliateEmail,
        affiliateCommission: s.affiliateCommission,
        date: s.grantedAt,
        dateSp: getSpDateString(s.grantedAt)
      });
    }
  }

  for (const q of queue) {
    if (q.eventType === 'purchase_approved' || q.eventType === 'approved' || q.eventType === 'paid') {
      const em = (q.customerEmail || '').toLowerCase().trim();
      const qName = (q.customerName || '').toLowerCase();
      if (qName.includes('john doe') || qName.includes('jon doe') || qName.includes('teste') || em.includes('example.com') || em.includes('teste') || em.includes('awdwad') || em.includes('willrandrier') || em.includes('randrierwill')) continue;
      if (Number(q.amount || 0) === 90 || Number(q.amount || 0) === 1) continue;

      const prev = approvedMap.get(em) || {};
      const dateVal = q.queuedAt || q.processedAt || prev.date;
      const isVitalicio = (q.plan === 'vitalicio' || prev.plan === 'vitalicio');
      const defaultGross = isVitalicio ? 49.99 : 19.99;
      const defaultDirectNet = isVitalicio ? 46.51 : 16.51;

      const isAffiliate = Boolean(q.isAffiliate || prev.isAffiliate);
      const affiliateCommission = Number(q.affiliateCommission || prev.affiliateCommission || 0);

      const grossAmount = Number(q.amount || prev.amount || defaultGross);
      let netAmount = Number(q.netAmount || prev.netAmount || 0);
      if (!netAmount) {
        netAmount = isAffiliate && affiliateCommission > 0 ? Math.max(0, defaultDirectNet - affiliateCommission) : defaultDirectNet;
      }

      approvedMap.set(em || ('queue_' + (q.queuedAt || Math.random())), {
        ...prev,
        customerName: q.customerName || prev.customerName || (em ? em.split('@')[0] : 'Cliente'),
        customerEmail: q.customerEmail || prev.customerEmail || '',
        customerPhone: q.customerPhone || prev.customerPhone || '',
        amount: grossAmount,
        netAmount: netAmount,
        plan: q.plan || prev.plan || 'mensal',
        isAffiliate,
        affiliateName: q.affiliateName || prev.affiliateName || '',
        affiliateEmail: q.affiliateEmail || prev.affiliateEmail || '',
        affiliateCommission,
        date: dateVal,
        dateSp: getSpDateString(dateVal)
      });
    }
  }

  const allApproved = Array.from(approvedMap.values());
  const approvedToday = allApproved.filter(item => item.dateSp === todaySp);

  const totalBrutoHoje = approvedToday.reduce((acc, item) => acc + item.amount, 0);
  const totalLiquidoHoje = approvedToday.reduce((acc, item) => acc + item.netAmount, 0);

  // Baseline auditado oficial da Cakto (Período: Sempre - confirmado diretamente no Dashboard da Cakto):
  // 13 vendas totais até hoje (10 Mensais | 3 Vitalícios) = R$ 327,29 líquido
  // Histórico anterior a 16/11: 12 vendas (9 Mensais + 3 Vitalícios) = R$ 310,78 líquido, R$ 329,88 bruto
  const CAKTO_HISTORICAL_AUDITED = {
    salesCount: 12,
    mensalCount: 9,
    vitalicioCount: 3,
    netRevenue: 310.78,
    grossRevenue: 329.88
  };

  const totalVendasAcumuladas = CAKTO_HISTORICAL_AUDITED.salesCount + approvedToday.length;
  const totalMensaisAcumuladas = CAKTO_HISTORICAL_AUDITED.mensalCount + approvedToday.filter(s => s.plan === 'mensal').length;
  const totalVitaliciosAcumulados = CAKTO_HISTORICAL_AUDITED.vitalicioCount + approvedToday.filter(s => s.plan === 'vitalicio').length;

  const totalBrutoGeral = CAKTO_HISTORICAL_AUDITED.grossRevenue + totalBrutoHoje;
  const totalLiquidoGeral = CAKTO_HISTORICAL_AUDITED.netRevenue + totalLiquidoHoje;

  const diretasCountHoje = approvedToday.filter(item => !item.isAffiliate).length;
  const afiliadosCountHoje = approvedToday.filter(item => item.isAffiliate).length;

  // 2. PIX Gerados (da fila da Cakto, descartando testes)
  const pixList = queue.filter(item => {
    const isPix = item.eventType === 'waiting_payment' || item.eventType === 'pix_gerado' || item.eventType === 'pix_generated';
    if (!isPix) return false;
    const qName = (item.customerName || '').toLowerCase();
    const em = (item.customerEmail || '').toLowerCase();
    if (qName.includes('john doe') || qName.includes('jon doe') || qName.includes('teste') || em.includes('example.com') || em.includes('teste') || em.includes('awdwad') || em.includes('willrandrier') || em.includes('randrierwill')) return false;
    if (Number(item.amount || 0) === 90 || Number(item.amount || 0) === 1) return false;
    return true;
  });
  const pixToday = pixList.filter(item => getSpDateString(item.queuedAt || item.processedAt) === todaySp);

  const totalPixCount = pixList.length;
  const totalApprovedCount = totalVendasAcumuladas;
  const conversionRate = (totalPixCount + approvedToday.length) > 0 
    ? ((approvedToday.length / (totalPixCount + approvedToday.length)) * 100).toFixed(1) + '%' 
    : (approvedToday.length > 0 ? '100%' : '0%');

  const batt = getBatteryInfo();
  const battText = batt.percent !== null ? `${batt.percent}% (${batt.status})` : 'Conectado via USB / Carregador';

  const uptimeHours = (process.uptime() / 3600).toFixed(1);
  const freeRamMb = Math.round(os.freemem() / 1024 / 1024);

  let vendasDetalhadasHoje = '';
  if (approvedToday.length > 0) {
    vendasDetalhadasHoje = `\n🧾 *CLIENTES QUE COMPRARAM HOJE (${todaySp}):*\n` +
      approvedToday.map((v, i) => {
        const originTag = v.isAffiliate
          ? `🤝 *Afiliado:* ${v.affiliateName || 'Parceiro'} (Comissão: R$ ${v.affiliateCommission.toFixed(2)})`
          : `🏷️ *Venda Direta (Sua - 100% Produtor)*`;
        return `  ${i + 1}. *${v.customerName}* (Plano ${String(v.plan).toUpperCase()})\n     💵 Bruto: R$ ${v.amount.toFixed(2)} | 💚 *Líquido no Seu Bolso: R$ ${v.netAmount.toFixed(2)}*\n     ${originTag}\n     📧 ${v.customerEmail}`;
      }).join('\n\n') + '\n';
  }

  return `${titleHeader}\n\n` +
    `💰 *Faturamento Bruto Hoje:* R$ ${totalBrutoHoje.toFixed(2)}\n` +
    `💚 *LÍQUIDO NO SEU BOLSO HOJE:* R$ ${totalLiquidoHoje.toFixed(2)}\n` +
    `🏆 *Vendas Aprovadas Hoje:* ${approvedToday.length} (${diretasCountHoje} Diretas | ${afiliadosCountHoje} Afiliados)\n` +
    `⚡ *PIX Gerados Hoje:* ${pixToday.length}\n` +
    `📈 *Faturamento Bruto Acumulado:* R$ ${totalBrutoGeral.toFixed(2)} (${totalVendasAcumuladas} assinaturas: ${totalMensaisAcumuladas} Mensais | ${totalVitaliciosAcumulados} Vitalícios)\n` +
    `💵 *Líquido Total Acumulado (Cakto):* R$ ${totalLiquidoGeral.toFixed(2)}\n` +
    `🎯 *Taxa de Conversão Hoje:* ${conversionRate}\n` +
    vendasDetalhadasHoje + `\n` +
    `👥 *FUNIL DE ATENDIMENTO (JARVIS):*\n` +
    `- Novos Leads Atendidos Hoje: ${leadsHoje}\n` +
    `- Total Histórico de Leads Atendidos: ${allLeads.length}\n` +
    `- Leads com Link Cakto (Histórico): ${withLinkCount}\n` +
    `- Em Recuperação Ativa (25m / 18h): ${activeCount}\n\n` +
    `📱 *SAÚDE DO MOTO G60 (SENTINELA):*\n` +
    `- Bateria: ${battText}\n` +
    `- Uptime: ${uptimeHours} horas ininterruptas\n` +
    `- Memória RAM Livre: ${freeRamMb} MB\n` +
    `- Servidor: 🟢 Online 24/7 (JARVIS V5: CAKTO NET PROFIT + AUDITED BASELINE)`;
}

// Sentinela de Uptime, Bateria e Relatórios Agendados (09:00 e 21:00)
async function checkScheduledReportsAndWatchdog() {
  if (!activeSock || !resolvedOwnerJid) return;

  // 1. Relatórios Diários Agendados (09:00 e 21:00 horário de Brasília)
  try {
    const brDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const hour = brDate.getHours();
    const minute = brDate.getMinutes();

    if ((hour === 9 || hour === 21) && minute === 0 && lastScheduledHour !== hour) {
      lastScheduledHour = hour;
      const periodName = hour === 9 ? '☀️ *BOM DIA! RELATÓRIO MATINAL GHOSTMARKET (CFO)*' : '🌙 *BOA NOITE! FECHAMENTO DO DIA GHOSTMARKET (CFO)*';
      const report = await generateCfoReport(periodName);
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
    const desiredCode = `const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3333;
const HOME = '/data/data/com.termux/files/home';
const FOLLOWUP_FILE = path.join(HOME, 'ghost-whatsapp-agent', 'leads_followup.json');
const PAUSED_FILE = path.join(HOME, 'ghost-whatsapp-agent', 'paused_chats.json');
const PROMISES_FILE = path.join(HOME, 'ghost-whatsapp-agent', 'scheduled_promises.json');
const CAKTO_FILE = path.join(HOME, 'ghost-whatsapp-agent', 'cakto_queue.json');

function getPhoneVariants(rawPhoneOrJid) {
  if (!rawPhoneOrJid) return [];
  const str = String(rawPhoneOrJid).trim();
  const digits = str.replace(/\\D/g, '');
  const variants = new Set();
  if (str) variants.add(str.toLowerCase());
  if (digits) variants.add(digits);
  if (digits) variants.add(digits + '@s.whatsapp.net');

  let ddd = '';
  let rest = '';
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    ddd = digits.slice(2, 4);
    rest = digits.slice(4);
  } else if (!digits.startsWith('55') && (digits.length === 10 || digits.length === 11)) {
    ddd = digits.slice(0, 2);
    rest = digits.slice(2);
  }

  if (ddd && rest) {
    const with9 = rest.length === 9 ? rest : ('9' + rest);
    const without9 = rest.length === 9 ? rest.slice(1) : rest;
    variants.add('55' + ddd + with9);
    variants.add('55' + ddd + without9);
    variants.add(ddd + with9);
    variants.add(ddd + without9);
    variants.add('55' + ddd + with9 + '@s.whatsapp.net');
    variants.add('55' + ddd + without9 + '@s.whatsapp.net');
  }

  if (digits.length >= 8) {
    variants.add(digits.slice(-8));
  }
  return Array.from(variants);
}

function loadPaused() {
  try {
    if (fs.existsSync(PAUSED_FILE)) {
      return JSON.parse(fs.readFileSync(PAUSED_FILE, 'utf-8'));
    }
  } catch (_) {}
  return {};
}

function savePaused(data) {
  try {
    fs.writeFileSync(PAUSED_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (_) {}
}

function loadPromises() {
  try {
    if (fs.existsSync(PROMISES_FILE)) {
      return JSON.parse(fs.readFileSync(PROMISES_FILE, 'utf-8'));
    }
  } catch (_) {}
  return {};
}

function savePromises(data) {
  try {
    fs.writeFileSync(PROMISES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (_) {}
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/ota') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (payload.secret !== 'ghost_ota_2026') {
          res.writeHead(403);
          return res.end('Forbidden');
        }
        if (payload.brainJs) {
          fs.writeFileSync(path.join(HOME, 'ghost-whatsapp-agent', 'brain.js'), payload.brainJs, 'utf-8');
        }
        if (payload.indexJs) {
          fs.writeFileSync(path.join(HOME, 'ghost-whatsapp-agent', 'index.js'), payload.indexJs, 'utf-8');
        }
        if (payload.audioDataJs) {
          fs.writeFileSync(path.join(HOME, 'ghost-whatsapp-agent', 'audio_data.js'), payload.audioDataJs, 'utf-8');
        }
        if (payload.audioBase64) {
          fs.writeFileSync(path.join(HOME, 'ghost-whatsapp-agent', 'audio_prova_social.mp3'), Buffer.from(payload.audioBase64, 'base64'));
        }
        if (payload.caktoQueueJson) {
          fs.writeFileSync(CAKTO_FILE, payload.caktoQueueJson, 'utf-8');
        }
        exec('/data/data/com.termux/files/usr/bin/node /data/data/com.termux/files/usr/lib/node_modules/pm2/bin/pm2 restart ghost-whatsapp-agent', () => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'OTA_SUCCESS' }));
        });
      } catch (err) {
        res.writeHead(500);
        res.end(err.message);
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/pause-chat') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (payload.secret !== 'ghost_ota_2026') {
          res.writeHead(403);
          return res.end('Forbidden');
        }
        const phone = payload.phone;
        const action = payload.action || 'pause';
        const reason = payload.reason || 'Manual via Painel';
        const paused = loadPaused();
        const variants = getPhoneVariants(phone);

        if (action === 'pause') {
          const entry = { phone: String(phone), paused: true, pausedAt: Date.now(), reason };
          for (const v of variants) {
            paused[v] = entry;
          }
        } else {
          for (const v of variants) {
            delete paused[v];
          }
          const clean = String(phone).replace(/\\D/g, '');
          if (clean.length >= 8) {
            const suffix = clean.slice(-8);
            for (const k of Object.keys(paused)) {
              if (k.endsWith(suffix)) delete paused[k];
            }
          }
        }
        savePaused(paused);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, phone, action, paused: action === 'pause' }));
      } catch (err) {
        res.writeHead(500);
        res.end(err.message);
      }
    });
    return;
  }

  if (req.url === '/api/paused-chats') {
    const paused = loadPaused();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ success: true, count: Object.keys(paused).length, pausedChats: paused }));
  }

  if (req.url === '/api/leads') {
    let leads = {};
    try {
      if (fs.existsSync(FOLLOWUP_FILE)) {
        leads = JSON.parse(fs.readFileSync(FOLLOWUP_FILE, 'utf-8'));
      }
    } catch (_) {}
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ status: 'OK', count: Object.keys(leads).length, leads }, null, 2));
  }

  if (req.method === 'POST' && req.url === '/api/schedule-promise') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (payload.secret !== 'ghost_ota_2026') {
          res.writeHead(403);
          return res.end('Forbidden');
        }
        const action = payload.action || 'create';
        const promises = loadPromises();

        if (action === 'create') {
          const cleanPhone = String(payload.phone || '').replace(/\\D/g, '');
          const id = payload.id || ('promise_' + cleanPhone + '_' + payload.isoDate);
          const entry = {
            id,
            phone: cleanPhone,
            jid: cleanPhone + '@s.whatsapp.net',
            senderName: payload.senderName || 'Lead Interessado',
            isoDate: payload.isoDate,
            formatted: payload.formatted || payload.isoDate,
            leadMessage: payload.leadMessage || 'Agendamento manual via Painel',
            status: 'pending',
            offer: payload.offer || 'vitalicio',
            createdAt: Date.now(),
            remindedAt: null,
            convertedAt: null,
            triggerImmediate: false
          };
          promises[id] = entry;
          savePromises(promises);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, promise: entry }));
        }

        if (action === 'update_status') {
          const { id, status } = payload;
          if (promises[id]) {
            promises[id].status = status;
            if (status === 'converted') promises[id].convertedAt = Date.now();
            savePromises(promises);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, promise: promises[id] }));
          }
          res.writeHead(404);
          return res.end(JSON.stringify({ error: 'Promise not found' }));
        }

        if (action === 'trigger_now') {
          const { id } = payload;
          if (promises[id]) {
            promises[id].triggerImmediate = true;
            savePromises(promises);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, triggered: id }));
          }
          res.writeHead(404);
          return res.end(JSON.stringify({ error: 'Promise not found' }));
        }

        if (action === 'delete') {
          const { id } = payload;
          if (promises[id]) {
            delete promises[id];
            savePromises(promises);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, deleted: id }));
          }
          res.writeHead(404);
          return res.end(JSON.stringify({ error: 'Promise not found' }));
        }

        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Unknown action' }));
      } catch (err) {
        res.writeHead(500);
        res.end(err.message);
      }
    });
    return;
  }

  if (req.url === '/api/promises') {
    const promises = loadPromises();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ success: true, count: Object.keys(promises).length, promises }));
  }

  if (req.method === 'POST' && req.url === '/api/cakto-event') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const headerSecret = req.headers['x-ghost-secret'];
        if (payload.secret !== 'ghost_ota_2026' && headerSecret !== 'ghost_ota_2026') {
          res.writeHead(403);
          return res.end('Forbidden');
        }

        let queue = [];
        try {
          if (fs.existsSync(CAKTO_FILE)) {
            queue = JSON.parse(fs.readFileSync(CAKTO_FILE, 'utf-8'));
          }
        } catch (_) {}
        if (!Array.isArray(queue)) queue = [];

        const isVitalicio = (payload.plan === 'vitalicio');
        const defaultGross = isVitalicio ? 49.99 : 19.99;
        const defaultNet = isVitalicio ? 46.51 : 16.51;

        const eventItem = {
          eventType: payload.eventType || 'waiting_payment',
          customerName: payload.customerName || 'Cliente',
          customerEmail: payload.customerEmail || '',
          customerPhone: payload.customerPhone || '',
          amount: Number(payload.amount || defaultGross),
          netAmount: Number(payload.netAmount || defaultNet),
          plan: payload.plan || 'mensal',
          isAffiliate: Boolean(payload.isAffiliate),
          affiliateName: payload.affiliateName || '',
          affiliateEmail: payload.affiliateEmail || '',
          affiliateCommission: Number(payload.affiliateCommission || 0),
          pixCode: payload.pixCode || '',
          queuedAt: Date.now(),
          processed: false
        };

        queue.push(eventItem);
        if (queue.length > 100) queue = queue.slice(-100);
        fs.writeFileSync(CAKTO_FILE, JSON.stringify(queue, null, 2), 'utf-8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, queued: true, eventType: eventItem.eventType }));
      } catch (err) {
        res.writeHead(500);
        res.end(err.message);
      }
    });
    return;
  }

  if (req.url === '/api/cakto-queue') {
    let queue = [];
    try {
      if (fs.existsSync(CAKTO_FILE)) {
        queue = JSON.parse(fs.readFileSync(CAKTO_FILE, 'utf-8'));
      }
    } catch (_) {}
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ success: true, count: queue.length, queue }));
  }

  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({
    status: 'ONLINE 24/7 (JARVIS V5: CAKTO NET PROFIT + AFFILIATE TRACKING)',
    server: 'Moto G60 Linux Server (Termux)',
    node_version: process.version,
    arch: os.arch(),
    platform: os.platform(),
    uptime_seconds: Math.round(process.uptime()),
    free_ram_mb: Math.round(os.freemem() / 1024 / 1024),
    total_ram_mb: Math.round(os.totalmem() / 1024 / 1024),
    timestamp: new Date().toISOString()
  }, null, 2));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('GhostAI Moto G60 Server V5 ativo na porta ' + PORT);
});`;

    let currentCode = fs.readFileSync(healthServerPath, 'utf-8');
    if (!currentCode.includes('JARVIS V5: CAKTO NET PROFIT + AFFILIATE TRACKING') || !currentCode.includes('/api/cakto-event')) {
      fs.writeFileSync(healthServerPath, desiredCode, 'utf-8');
      exec('/data/data/com.termux/files/usr/bin/node /data/data/com.termux/files/usr/lib/node_modules/pm2/bin/pm2 restart ghost-server 2>/dev/null || pm2 restart ghost-server 2>/dev/null || true');
      console.log('✅ health_server.js atualizado com suporte completo a /api/cakto-event (V5 Net Profit & Afiliados)!');
    }
  } catch (e) {
    console.error('Erro ao verificar health_server:', e.message);
  }
}

// Sincronização automática contínua de chats pausados com o Firestore
async function syncFirestorePausedChats() {
  try {
    const authRes = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDafvRbIgwriRgCis2sAmJeJ80RHmn30LA', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true })
    });
    const authData = await authRes.json();
    const idToken = authData.idToken;
    if (!idToken) return;

    const res = await fetch('https://firestore.googleapis.com/v1/projects/ghostmarket-ai-2cc26/databases/(default)/documents/paused_chats', {
      headers: { 'Authorization': `Bearer ${idToken}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.documents && Array.isArray(data.documents)) {
      for (const d of data.documents) {
        const id = d.name.split('/').pop();
        const reason = d.fields?.reason?.stringValue || 'Painel Web';
        setChatPaused(id, true, reason);
      }
    }
  } catch (_) {}
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
  resolved = resolved.replace(/\[PROMISE_DATE:[^\]]+\]/g, '').trim();
  const hasAudioProva = resolved.includes('[SEND_AUDIO_PROVA]');
  resolved = resolved.replace(/\[SEND_AUDIO_PROVA\]/g, '').trim();

  const balloons = splitIntoWhatsAppBalloons(resolved);

  if (balloons.length <= 1) {
    // 1 Balão curto: digitação dinâmica de 3.0s a 4.5s
    await sock.sendPresenceUpdate('composing', toJid);
    const delay = Math.floor(Math.random() * 1500) + 3000;
    console.log(`⏳ Simulando digitação por ${(delay / 1000).toFixed(1)}s (1 balão)...`);
    await new Promise(r => setTimeout(r, delay));
    await sendBotMessage(sock, toJid, { text: balloons[0] || resolved });
    await sock.sendPresenceUpdate('paused', toJid);

    if (hasAudioProva) {
      const audioPath = path.join(__dirname, 'audio_prova_social.mp3');
      if (!fs.existsSync(audioPath) && AUDIO_PROVA_BASE64) {
        try { fs.writeFileSync(audioPath, Buffer.from(AUDIO_PROVA_BASE64, 'base64')); } catch (_) {}
      }
      if (fs.existsSync(audioPath)) {
        console.log(`🎙️ [ÁUDIO PROVA ELEVENLABS] Enviando áudio de prova social para ${toJid}...`);
        try {
          await sock.sendPresenceUpdate('recording', toJid);
          await new Promise(r => setTimeout(r, 1500));
          const audioBuf = fs.readFileSync(audioPath);
          try {
            await sendBotMessage(sock, toJid, {
              audio: audioBuf,
              mimetype: 'audio/mp4',
              ptt: true,
              contextInfo: { isForwarded: true, forwardingScore: 1 }
            });
          } catch (pttErr) {
            console.warn('Fallback envio áudio para audio/mpeg:', pttErr.message);
            await sendBotMessage(sock, toJid, {
              audio: audioBuf,
              mimetype: 'audio/mpeg',
              contextInfo: { isForwarded: true, forwardingScore: 1 }
            });
          }
          await sock.sendPresenceUpdate('paused', toJid);
        } catch (audioSendErr) {
          console.error('Erro ao enviar áudio prova:', audioSendErr.message);
        }
      }
    }
  } else {
    // 2 Balões Fracionados (WhatsApp 100% natural):
    // Balão 1: saudação/reação rápida com digitação de 1.8s a 2.5s
    console.log(`💬 [Balão 1/2]: "${balloons[0]}"`);
    await sock.sendPresenceUpdate('composing', toJid);
    const delay1 = Math.floor(Math.random() * 700) + 1800;
    await new Promise(r => setTimeout(r, delay1));
    await sendBotMessage(sock, toJid, { text: balloons[0] });
    await sock.sendPresenceUpdate('paused', toJid);

    // Se tiver áudio de prova social, envia no meio como áudio encaminhado
    if (hasAudioProva) {
      const audioPath = path.join(__dirname, 'audio_prova_social.mp3');
      if (!fs.existsSync(audioPath) && AUDIO_PROVA_BASE64) {
        try { fs.writeFileSync(audioPath, Buffer.from(AUDIO_PROVA_BASE64, 'base64')); } catch (_) {}
      }
      if (fs.existsSync(audioPath)) {
        console.log(`🎙️ [ÁUDIO PROVA ELEVENLABS] Enviando áudio de prova social para ${toJid}...`);
        try {
          await sock.sendPresenceUpdate('recording', toJid);
          await new Promise(r => setTimeout(r, 1500));
          const audioBuf = fs.readFileSync(audioPath);
          try {
            await sendBotMessage(sock, toJid, {
              audio: audioBuf,
              mimetype: 'audio/mp4',
              ptt: true,
              contextInfo: { isForwarded: true, forwardingScore: 1 }
            });
          } catch (pttErr) {
            console.warn('Fallback envio áudio para audio/mpeg:', pttErr.message);
            await sendBotMessage(sock, toJid, {
              audio: audioBuf,
              mimetype: 'audio/mpeg',
              contextInfo: { isForwarded: true, forwardingScore: 1 }
            });
          }
          await sock.sendPresenceUpdate('paused', toJid);
          await new Promise(r => setTimeout(r, 2000));
        } catch (audioSendErr) {
          console.error('Erro ao enviar áudio prova:', audioSendErr.message);
        }
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
    await sendBotMessage(sock, toJid, { text: balloons[1] });
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

          let originLine = '';
          if (isApproved) {
            if (item.isAffiliate) {
              originLine = `🤝 *Venda por Afiliado:*\n   • *Afiliado:* ${item.affiliateName || 'Parceiro'}\n   • *Comissão Afiliado:* R$ ${Number(item.affiliateCommission || 0).toFixed(2)}\n   • 💚 *Líquido no Seu Bolso:* R$ ${Number(item.netAmount || 0).toFixed(2)}`;
            } else {
              const defaultNet = item.plan === 'vitalicio' ? 46.51 : 16.51;
              originLine = `🏷️ *Origem:* Venda Direta (Sua - 100% Produtor)\n   • 💚 *Líquido no Seu Bolso:* R$ ${Number(item.netAmount || defaultNet).toFixed(2)}`;
            }
          }

          const alertText = `${title}\n\n` +
            `👤 *Nome:* ${item.customerName || 'Cliente'}\n` +
            `📱 *WhatsApp:* https://wa.me/${formattedPhone || 'sem-fone'}\n` +
            `📧 *Gmail:* ${item.customerEmail || 'não informado'}\n` +
            `💰 *Valor Bruto:* R$ ${Number(item.amount || (item.plan === 'vitalicio' ? 49.99 : 19.99)).toFixed(2)}\n` +
            `👑 *Plano:* ${String(item.plan || 'mensal').toUpperCase()}\n` +
            (originLine ? `${originLine}\n\n` : '\n') +
            `${actionNote}`;
          await activeSock.sendMessage(resolvedOwnerJid, { text: alertText });
        }
      } catch (err) {
        console.error('Erro ao notificar dono sobre evento:', err.message);
      }
    }
  }

  // -------------------------------------------------------------
  // LOOP VIRAL DE AFILIADOS PÓS-COMPRA (20h a 72h após aprovação)
  // -------------------------------------------------------------
  const now = Date.now();
  let queueModified = pending.length > 0;

  for (const item of queue) {
    const isApproved = item.eventType === 'purchase_approved' || item.eventType === 'approved' || item.eventType === 'paid';
    if (isApproved && item.processed && !item.affiliateInvited) {
      const approvedTime = item.approvedAt || item.processedAt || item.queuedAt || item.timestamp || 0;
      const hoursPassed = (now - approvedTime) / (1000 * 60 * 60);

      // Dispara o convite entre 20h e 72h após a aprovação da compra
      if (hoursPassed >= 20 && hoursPassed <= 72) {
        const formattedPhone = formatBrazilWhatsAppPhone(item.customerPhone);
        if (formattedPhone) {
          const targetJid = `${formattedPhone}@s.whatsapp.net`;
          try {
            const onWa = await activeSock.onWhatsApp(formattedPhone);
            if (onWa && onWa.some(c => c.exists)) {
              const inviteMsg = buildCaktoPostPurchaseAffiliateInvite(item);
              await sendHumanizedBalloons(activeSock, targetJid, inviteMsg);
              console.log(`🤝 [CONVITE AFILIADO PÓS-COMPRA] Enviado com sucesso para ${targetJid}`);
              item.affiliateInvited = true;
              item.affiliateInvitedAt = now;
              queueModified = true;

              if (resolvedOwnerJid) {
                await activeSock.sendMessage(resolvedOwnerJid, {
                  text: `🤝 *CONVITE DE AFILIADO ENVIADO!*\n\nCliente: *${item.customerName || 'Cliente'}*\nWhatsApp: https://wa.me/${formattedPhone}\nO Jarvis acabou de enviar o convite com o Kit do Afiliado para transformar esse comprador em parceiro!`
                });
              }
            }
          } catch (err) {
            console.error(`Erro ao disparar convite de afiliado para ${formattedPhone}:`, err.message);
          }
        }
      }
    }
  }

  // Manter os últimos 50 eventos para histórico
  if (queueModified) {
    try {
      fs.writeFileSync(CAKTO_QUEUE_FILE, JSON.stringify(queue.slice(-50), null, 2), 'utf-8');
    } catch (_) {}
  }
}

// -------------------------------------------------------------
// SENTINELA DA AGENDA & PROMESSAS DE FECHAMENTO
// -------------------------------------------------------------
let lastPromiseCheckHour = null;

async function checkScheduledPaymentPromises(sock) {
  if (!sock) return;

  const promises = loadPromises();
  const promiseList = Object.values(promises);
  if (!promiseList.length) return;

  // 1. Processar disparos imediatos manuais solicitados pelo Painel
  for (const p of promiseList) {
    if (p.triggerImmediate && p.status !== 'converted') {
      try {
        console.log(`🚀 [DISPARO MANUAL] Enviando lembrete de promessa para ${p.phone}...`);
        const closingMsg = buildPromisedClosingMessage(p.senderName, p.offer);
        await sendHumanizedBalloons(sock, p.jid, closingMsg);
        p.triggerImmediate = false;
        p.status = 'reminded';
        p.remindedAt = Date.now();
        promises[p.id] = p;
        savePromises(promises);
        syncPromiseToFirestore(p).catch(() => {});

        if (resolvedOwnerJid && p.jid !== resolvedOwnerJid) {
          await sock.sendMessage(resolvedOwnerJid, {
            text: `🚀 *LEMBRETE DE VENDA DISPARADO PELO PAINEL!*\n\n👤 *Cliente:* ${p.senderName}\n📱 *WhatsApp:* https://wa.me/${p.phone}\n🗓️ *Data Combinada:* ${p.formatted}\n👉 Mensagem humanizada com link enviada com sucesso!`
          });
        }
      } catch (err) {
        console.error('Erro ao disparar lembrete imediato de promessa:', err.message);
      }
    }
  }

  // 2. Disparo Matinal Automático (entre 09:30 e 11:30 no horário de Brasília)
  try {
    const brDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const hour = brDate.getHours();

    if (hour >= 9 && hour < 12 && lastPromiseCheckHour !== hour) {
      lastPromiseCheckHour = hour;

      const yyyy = brDate.getFullYear();
      const mm = String(brDate.getMonth() + 1).padStart(2, '0');
      const dd = String(brDate.getDate()).padStart(2, '0');
      const todayIso = `${yyyy}-${mm}-${dd}`;

      for (const p of Object.values(promises)) {
        if (p.status === 'pending' && !p.remindedAt && p.isoDate <= todayIso) {
          if (isChatPaused(p.phone, p.jid)) {
            console.log(`⏸️ [AGENDA] Chat ${p.phone} está pausado manualmente, pulando disparo automático.`);
            continue;
          }

          try {
            console.log(`📅 [AGENDA] Enviando lembrete matinal agendado para ${p.phone} (${p.formatted})...`);
            const closingMsg = buildPromisedClosingMessage(p.senderName, p.offer);
            await sendHumanizedBalloons(sock, p.jid, closingMsg);
            p.status = 'reminded';
            p.remindedAt = Date.now();
            promises[p.id] = p;
            savePromises(promises);
            syncPromiseToFirestore(p).catch(() => {});

            if (resolvedOwnerJid && p.jid !== resolvedOwnerJid) {
              await sock.sendMessage(resolvedOwnerJid, {
                text: `📅 *LEMBRETE MATINAL DE VENDA DISPARADO PELO JARVIS!*\n\n👤 *Cliente:* ${p.senderName}\n📱 *WhatsApp:* https://wa.me/${p.phone}\n🗓️ *Data Combinada:* ${p.formatted}\n👉 *Jarvis liberou o link do Vitalício com os 7 dias de garantia!*`
              });
            }
            // Delay suave entre disparos
            await new Promise(r => setTimeout(r, 6000));
          } catch (err) {
            console.error(`Erro ao disparar lembrete de promessa para ${p.phone}:`, err.message);
          }
        }
      }
    } else if (hour < 9 || hour >= 12) {
      lastPromiseCheckHour = null;
    }
  } catch (err) {
    console.error('Erro na checagem de promessas de pagamento:', err.message);
  }
}

async function processFollowUpQueue() {
  if (!activeSock) return;
  const now = Date.now();
  let changed = false;

  for (const [jid, lead] of Object.entries(leadsFollowUp)) {
    if (!lead || lead.converted || lead.stoppedFollowUp || lead.stage >= 3) continue;
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
  ensureGabrielSaleInQueue();

  // Sincronização contínua de chats pausados com o Firestore
  syncFirestorePausedChats().catch(() => {});
  let firestorePauseInterval = null;
  if (!firestorePauseInterval) {
    firestorePauseInterval = setInterval(() => {
      syncFirestorePausedChats().catch(() => {});
    }, 12 * 1000);
  }

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

  let promisesInterval = null;
  if (!promisesInterval) {
    promisesInterval = setInterval(() => {
      checkScheduledPaymentPromises(activeSock).catch(e => console.error('Erro loop promessas:', e.message));
    }, 10 * 1000);
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

      // Envia notificação de atualização e relatório corrigido ao Dono
      setTimeout(async () => {
        try {
          if (activeSock && resolvedOwnerJid) {
            const cfoReport = await generateCfoReport('🌙 *FECHAMENTO DO DIA CORRIGIDO (GHOSTMARKET CFO)*');
            await activeSock.sendMessage(resolvedOwnerJid, { text: cfoReport });
            console.log('✅ Fechamento do dia corrigido enviado ao dono após conexão!');
          }
        } catch (e) {
          console.error('Erro envio fechamento pós-conexão:', e.message);
        }
      }, 5000);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    for (const msg of messages) {
      const from = msg.key?.remoteJid;
      if (!from || from === 'status@broadcast') continue;

      if (msg.key?.fromMe) {
        // Se a mensagem partiu da gente mas NÃO foi gerada pelo robô: foi o humano digitando!
        const msgId = msg.key?.id;
        if (msgId && !botSentMessageIds.has(msgId) && from && !from.includes('@broadcast') && !from.endsWith('@g.us')) {
          console.log(`👤 [TAKEOVER MANUAL DETECTADO] O operador enviou mensagem manual para ${from}. Pausando IA automaticamente!`);
          setChatPaused(from, true, 'Operador digitou diretamente no WhatsApp');
        }
        continue;
      }

      const isGroup = from.endsWith('@g.us');
      const isBroadcast = from.includes('@broadcast') || from.endsWith('@newsletter');
      if (isGroup || isBroadcast) continue;

      const senderName = msg.pushName || 'Cliente';
      const cleanPhone = from.replace('@s.whatsapp.net', '').replace('@lid', '');

      // 0. VERIFICAÇÃO DE PAUSA MANUAL (HUMAN TAKEOVER):
      if (isChatPaused(cleanPhone, from)) {
        console.log(`⏸️ [CHAT PAUSADO - ATENDIMENTO MANUAL] Mensagem de +${cleanPhone} recebida, mas IA está pausada para atendimento manual.`);
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

        if (cleanLower === '!cfo' || cleanLower === '!vendas' || cleanLower === '!financeiro' || cleanLower === '!fechamento' || cleanLower === '!relatorio') {
          await sock.sendPresenceUpdate('composing', from);
          const report = await generateCfoReport('💰 *RESUMO FINANCEIRO SOLICITADO (CFO)*');
          await sock.sendMessage(from, { text: report });
          await sock.sendPresenceUpdate('paused', from);
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

      // 1. Verificar se o lead confirmou que já comprou/pagou
      const paidRegex = /(j[aá] paguei|comprei|j[aá] comprei|acabei de pagar|fiz o pix|j[aá] fiz|paguei|t[aá] pago|ta pago|j[aá] assinei|ja assinei|fiz o pagamento|pagamento feito|pago|paguei o pix|pagamento aprovado)/i;
      const hasPaid = paidRegex.test(text);

      // 1B. Verificar se o lead pediu cancelamento / opt-out / não quer mais mensagens
      const optOutRegex = /(n[aã]o quero|n[aã]o vou querer|n[aã]o tenho interesse|sem interesse|deixa pra l[aá]|cancela|cancelar|n[aã]o precisa|desisti|n[aã]o gostei|para de mandar|tira meu n[uú]mero|n[aã]o me manda)/i;
      const isOptOut = optOutRegex.test(text);

      // 1C. Verificar se o lead agendou o pagamento para uma data futura
      const scheduledRegex = /(vou pagar|pago dia|pago amanh[aã]|s[oó] dia|s[oó] amanh[aã]|semana que vem|m[eê]s que vem|quando receber|quinto dia [uú]til|fim do m[eê]s|quando virar|depois do dia|pago sexta|pago segunda|pago ter[çc]a|pago quarta|pago quinta|pago s[aá]bado|pago domingo)/i;
      const isScheduled = scheduledRegex.test(text);

      // 2. Identificar se é Lead Quente
      const hotLeadRegex = /(pix|pagar|pagamento|assinar|cartao|cartão|boleto|comprar|fechar|humano|atendente|falar com alguem|falar com o dono|link de pagamento|vitalicio|vitalício|mensal)/i;
      const isHotLead = (hotLeadRegex.test(text) || hasPaid) && !isOptOut;

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

        // 3B. Identificar e Registrar Promessa de Pagamento / Segurar Vaga
        let detectedPromise = null;
        const promiseTagMatch = aiReply.match(/\[PROMISE_DATE:([^:]+):([^\]]+)\]/);
        if (promiseTagMatch) {
          const isoDate = promiseTagMatch[1];
          const formatted = decodeURIComponent(promiseTagMatch[2]);
          detectedPromise = {
            id: `promise_${cleanPhone}_${isoDate}`,
            phone: cleanPhone,
            jid: from,
            senderName: senderName || 'Lead Interessado',
            isoDate,
            formatted,
            leadMessage: text,
            status: 'pending',
            offer: 'vitalicio',
            createdAt: Date.now(),
            remindedAt: null,
            convertedAt: null
          };
        } else {
          const extracted = extractPromisedPaymentDate(text);
          if (extracted?.hasPromise) {
            detectedPromise = {
              id: `promise_${cleanPhone}_${extracted.isoDate}`,
              phone: cleanPhone,
              jid: from,
              senderName: senderName || 'Lead Interessado',
              isoDate: extracted.isoDate,
              formatted: extracted.formatted,
              leadMessage: text,
              status: 'pending',
              offer: 'vitalicio',
              createdAt: Date.now(),
              remindedAt: null,
              convertedAt: null
            };
          }
        }

        if (detectedPromise) {
          const promises = loadPromises();
          promises[detectedPromise.id] = {
            ...(promises[detectedPromise.id] || {}),
            ...detectedPromise
          };
          savePromises(promises);
          syncPromiseToFirestore(detectedPromise).catch(() => {});

          if (resolvedOwnerJid && from !== resolvedOwnerJid) {
            try {
              await sock.sendMessage(resolvedOwnerJid, {
                text: `📅 *NOVO AGENDAMENTO DE VENDA IDENTIFICADO!*\n\n👤 *Nome:* ${senderName}\n📱 *WhatsApp do Lead:* https://wa.me/${cleanPhone}\n🗓️ *Data Combinada:* ${detectedPromise.formatted}\n💬 *Mensagem do Lead:*\n"${text}"\n\n👉 *O Jarvis agendou o disparo automático matinal para ${detectedPromise.formatted}!*`
              });
            } catch (_) {}
          }
        }

        // 4. Atualizar estado do Follow-up Automático
        const existingLead = leadsFollowUp[from] || {};
        const replyHasCheckout = fullReply.includes('pay.cakto.com.br');
        const isConfirmedApproved = fullReply.includes('Encontrei aqui seu acesso aprovado');

        const isConverted = Boolean(existingLead.converted || hasPaid || isConfirmedApproved);
        const shouldStopFollowUp = Boolean(isConverted || isOptOut || isScheduled || detectedPromise || existingLead.stoppedFollowUp);

        leadsFollowUp[from] = {
          jid: from,
          phone: cleanPhone,
          senderName,
          lastUserMessage: text,
          lastInteractionAt: Date.now(),
          stage: shouldStopFollowUp ? 99 : 0,
          sentCheckoutLink: Boolean(existingLead.sentCheckoutLink || replyHasCheckout),
          converted: isConverted,
          stoppedFollowUp: shouldStopFollowUp,
          stopReason: isConverted ? 'converted' : isOptOut ? 'opt_out' : (isScheduled || detectedPromise) ? 'scheduled_payment' : null
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
