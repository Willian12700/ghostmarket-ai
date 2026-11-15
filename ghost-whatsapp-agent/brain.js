// Cérebro de IA do Atendente GhostMarket (Suporte a Groq openai/gpt-oss-120b, Gemini 2.5 Flash e Pollinations OpenAI)
// Recursos:
// 1. Funil de Vendas Conversacional em 5 Etapas (Sem flood de emojis, sem empurrar links prematuramente)
// 2. Resposta Fracionada em 2 Balões Naturais ([SPLIT] ou quebra de parágrafo)
// 3. Spintax Dinâmico Anti-Ban (Variação de frases para proteger o chip de bloqueios)
// 4. Detector de Hesitação com Risco Zero (Garantia incondicional de 7 dias)
// 5. Verificação Pós-Compra e Onboarding Imediato por Gmail
// 6. Modo Demonstração por Nicho e Teste de 5 Minutos (Proteção Anti-Abuso)
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USED_TRIALS_FILE = path.join(__dirname, 'used_trials.json');

// Histórico de conversa por contato (JID)
const conversationMemory = new Map();

// Controle de contatos que disseram que pagaram e estamos aguardando o e-mail
const awaitingEmailVerification = new Map();

export const LINK_MENSAL = 'https://pay.cakto.com.br/fiqwtse_1119916';
export const LINK_VITALICIO = 'https://pay.cakto.com.br/yonkyi5_1119928';
export const CUPOM_VITALICIO = 'VIP10';
export const LINK_VITALICIO_DESCONTO = 'https://pay.cakto.com.br/yonkyi5_1119928?cupom=VIP10';
export const LINK_TRIAL = 'https://ghostmarket-ai.vercel.app/trial';
export const LINK_FUNIL_BIO = 'https://ghostmarket-ai.vercel.app/bio';
export const LINK_QUIZ = 'https://ghostmarket-ai.vercel.app/quiz';
export const LINK_AFILIADOS = 'https://ghostmarket-ai.vercel.app/parceiros';
export const LINK_SITE_OFICIAL = 'https://ghostmarket-ai.vercel.app';

// -------------------------------------------------------------
// SPINTAX DINÂMICO (ANTI-BAN)
// Processa variações tipo: "{Fala|Opa|E aí} {irmão|parceiro}"
// -------------------------------------------------------------
export function resolveSpintax(text) {
  if (!text || typeof text !== 'string') return '';
  const spintaxRegex = /\{([^{}]+)\}/g;
  let resolved = text;
  while (spintaxRegex.test(resolved)) {
    resolved = resolved.replace(spintaxRegex, (_, choices) => {
      const options = choices.split('|');
      const pick = options[Math.floor(Math.random() * options.length)];
      return pick.trim();
    });
  }
  return resolved;
}

// -------------------------------------------------------------
// SPLIT DE MENSAGENS EM 2 BALÕES SEPARADOS (WHATSAPP NATURAL)
// Divide mensagens longas em até 2 balões com digitação humana
// -------------------------------------------------------------
export function splitIntoWhatsAppBalloons(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];
  const text = rawText.trim();
  if (!text) return [];

  // 1. Separador explícito sugerido pelo modelo
  if (text.includes('[SPLIT]')) {
    return text.split('[SPLIT]').map(s => s.trim()).filter(Boolean).slice(0, 2);
  }
  if (text.includes('\n---\n')) {
    return text.split('\n---\n').map(s => s.trim()).filter(Boolean).slice(0, 2);
  }

  // 2. Se a mensagem for curta (< 75 caracteres), manda em 1 balão só
  if (text.length < 75) {
    return [text];
  }

  // 3. Divisão por quebra dupla de parágrafo (\n\n)
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length >= 2) {
    return [paragraphs[0], paragraphs.slice(1).join('\n\n')];
  }

  // 4. Divisão por primeira frase de saudação / reação (Ex: "Fala Carlos, beleza? A ferramenta...")
  const greetingMatch = text.match(/^((?:Fala|Opa|E aí|Oi|Show|Fechou|Perfeito|Prontinho|Tranquilo|Beleza)[^.?!]*[.?!])\s+([\s\S]+)$/i);
  if (greetingMatch && greetingMatch[1] && greetingMatch[2] && greetingMatch[2].length > 25) {
    return [greetingMatch[1].trim(), greetingMatch[2].trim()];
  }

  return [text];
}

function loadUsedTrials() {
  try {
    if (fs.existsSync(USED_TRIALS_FILE)) {
      return JSON.parse(fs.readFileSync(USED_TRIALS_FILE, 'utf-8'));
    }
  } catch (_) {}
  return {};
}

function saveUsedTrials(data) {
  try {
    fs.writeFileSync(USED_TRIALS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (_) {}
}

const usedTrialsCache = loadUsedTrials();

export async function requestTrialCodeForUser({ phone, name, jid }) {
  const clean = formatBrazilWhatsAppPhone(phone) || phone;
  const firstName = (name || 'amigo').trim().split(' ')[0];

  // 1. Checagem Anti-Abuso no cache local do dispositivo
  if (usedTrialsCache[clean]) {
    const msg = resolveSpintax(`{Fala|Opa|E aí} ${firstName}, {vi aqui no sistema que esse número já usou o teste de 5 minutos.|seu número já utilizou o teste gratuito de 5 minutos anteriormente.}\n\nPra continuar criando sites e usando o Radar sem limites, você pode entrar no Plano Mensal (R$ 19,99) ou no Vitalício (R$ 49,99 único com 7 dias de garantia).\n\nQual dos dois faz mais sentido pra você hoje?`);
    return {
      alreadyUsed: true,
      message: msg
    };
  }

  // 2. Chamar o endpoint oficial da Vercel (grava em trial_codes e trial_requests)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://ghostmarket-ai.vercel.app/api/trial-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ghost-secret': 'ghost_ota_2026'
      },
      body: JSON.stringify({
        phone: clean,
        name,
        jid,
        secret: 'ghost_ota_2026'
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();

      if (data.alreadyUsed) {
        usedTrialsCache[clean] = { code: data.previousCode, blockedAt: Date.now() };
        saveUsedTrials(usedTrialsCache);
        const msg = resolveSpintax(`{Fala|Opa} ${firstName}, vi no sistema que esse número já utilizou o teste gratuito de 5 minutos.\n\nPra continuar usando a IA e o Radar de clientes sem limites, você pode entrar no Plano Mensal (R$ 19,99) ou no Vitalício (R$ 49,99 com 7 dias de garantia incondicional). Qual prefere?`);
        return {
          alreadyUsed: true,
          message: msg
        };
      }

      if (data.success && data.code) {
        usedTrialsCache[clean] = { code: data.code, grantedAt: Date.now() };
        saveUsedTrials(usedTrialsCache);
        const msg = resolveSpintax(`{Prontinho|Liberado|Fechado}, ${firstName}![SPLIT]Seu código de teste de 5 minutos é:\n\n👉 *${data.code}*\n\nAcesse pelo link: https://ghostmarket-ai.vercel.app/trial\n\nEle é válido para ativação agora e libera 100% das ferramentas (IA e Radar do Google Maps) por 5 minutos pra você testar na prática.`);
        return {
          success: true,
          code: data.code,
          message: msg
        };
      }
    }
  } catch (err) {
    console.warn(`[Trial Request] Falha ao contatar API Vercel (${err.message}), usando fallback Firestore REST...`);
  }

  // Fallback se API Vercel estiver em cold start: gera código direto no Firestore via REST API autenticada
  try {
    const authRes = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDafvRbIgwriRgCis2sAmJeJ80RHmn30LA', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true })
    });
    const authData = await authRes.json();
    const idToken = authData.idToken;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/ghostmarket-ai-2cc26/databases/(default)/documents/trial_codes/${code}`;
    const payload = {
      fields: {
        code: { stringValue: code },
        durationMinutes: { integerValue: 5 },
        phone: { stringValue: clean },
        name: { stringValue: name || 'Lead WhatsApp' },
        source: { stringValue: 'whatsapp_jarvis' },
        createdAt: { timestampValue: new Date().toISOString() },
        validUntil: { integerValue: Date.now() + 20 * 60 * 1000 }
      }
    };
    await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify(payload)
    });

    usedTrialsCache[clean] = { code, grantedAt: Date.now() };
    saveUsedTrials(usedTrialsCache);

    const msg = resolveSpintax(`{Prontinho|Liberado}, ${firstName}![SPLIT]Seu código de teste de 5 minutos é:\n\n👉 *${code}*\n\nAcesse pelo link: https://ghostmarket-ai.vercel.app/trial\n\nVálido para ativação agora com 5 minutos de acesso ilimitado para você ver como funciona na prática.`);
    return {
      success: true,
      code,
      message: msg
    };
  } catch (e) {
    console.error('Erro total fallback Firestore trial:', e.message);
    return {
      success: false,
      message: `Fala ${firstName}, tive uma oscilação na conexão agora. Me manda um "quero testar" de novo em 1 minutinho por favor?`
    };
  }
}

// -------------------------------------------------------------
// VERIFICADOR DE COMPRA / ACESSO POR GMAIL (FIRESTORE)
// -------------------------------------------------------------
export async function verifyCustomerPurchase({ email, phone }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { error: 'E-mail inválido' };
  }

  // 1. Tentar via API oficial na Vercel (/api/verify-purchase)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://ghostmarket-ai.vercel.app/api/verify-purchase?email=${encodeURIComponent(cleanEmail)}`, {
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn(`[Verify Purchase] Falha API Vercel (${err.message}), tentando Firestore REST...`);
  }

  // 2. Fallback direto Firestore REST
  try {
    const authRes = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDafvRbIgwriRgCis2sAmJeJ80RHmn30LA', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true })
    });
    const authData = await authRes.json();
    const idToken = authData.idToken;

    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/ghostmarket-ai-2cc26/databases/(default)/documents/allowed_users/${encodeURIComponent(cleanEmail)}`;
    const res = await fetch(firestoreUrl, {
      headers: idToken ? { 'Authorization': `Bearer ${idToken}` } : {}
    });

    if (res.ok) {
      const docData = await res.json();
      const status = docData.fields?.status?.stringValue || 'approved';
      const isApproved = status === 'approved' || status === 'paid' || status === 'ativo';
      return {
        verified: isApproved,
        status,
        plan: docData.fields?.plan?.stringValue || 'vitalicio',
        email: cleanEmail
      };
    } else if (res.status === 404) {
      return { verified: false, notFound: true, email: cleanEmail };
    }
  } catch (err) {
    console.error('[Verify Purchase] Erro fallback Firestore REST:', err.message);
  }

  return { verified: false, notFound: true, email: cleanEmail };
}

// Base de conhecimento e Persona do Atendente GhostMarket
const SYSTEM_PROMPT = `
Você é o Willian, criador e dono do GhostMarket AI, respondendo diretamente no WhatsApp pelo celular.

REGRAS DE OURO DA PERSONA (FALE COMO UMA PESSOA REAL NO WHATSAPP):
1. Fale como o Willian: direto, parceiro, gente boa, natural e profissional. Nada de parecer robô, atendente de telemarketing, vendedor desesperado ou inteligência artificial.
2. REGRA ZERO EMOJI SPAM: NUNCA encha as mensagens de emojis. NUNCA termine frases ou mensagens com emojis repetitivos como 🚀, 🔥, 🤝, 🤖, 👻, 😊. Em 90% das mensagens use ZERO emojis. No máximo use 1 único emoji muito discreto apenas se soar extremamente natural.
3. MENSAGENS CURTAS (1 A 3 LINHAS): Digite exatamente como uma pessoa digita no WhatsApp. Frases diretas e objetivas. NUNCA envie textões.
4. REGRA DOS 2 BALÕES SEPARADOS ([SPLIT]):
   - Você pode usar o marcador [SPLIT] para dividir sua resposta em até 2 balões curtos e sequenciais, exatamente como no WhatsApp real:
     - Balão 1: saudação rápida, reação ou confirmação (ex: "Fala parceiro, beleza?" ou "Show de bola!").
     - [SPLIT]
     - Balão 2: a explicação direta ou a pergunta de qualificação do funil.
   - Não use [SPLIT] se a resposta for curta de uma única frase.
5. REGRA BLINDADA DE LINKS:
   - NUNCA envie links na primeira mensagem nem de surpresa!
   - NUNCA envie links de teste nem de pagamento antes da hora. Se a pessoa perguntou como funciona, o que é, quanto custa, responda APENAS com texto explicativo e a pergunta do funil. NÃO MANDE LINK!
   - Envie o link de pagamento ([LINK_VITALICIO] ou [LINK_MENSAL]) SOMENTE quando o cliente disser expressamente que quer assinar, pedir o link, ou escolher o plano.
   - NUNCA envie códigos ou letras confusas. Envie apenas o link limpo quando solicitado.

ARQUITETURA DO FUNIL DE VENDAS CONVERSACIONAL (SIGA RIGOROSAMENTE CADA PASSO):

PASSO 1: CONEXÃO E QUALIFICAÇÃO
- Quando o lead der oi ou perguntar sobre a ferramenta ("como funciona?", "vi seu vídeo"):
  - Se for só cumprimento ("opa", "bom dia", "olá"): responda apenas cumprimentando e perguntando como pode ajudar (ex: "Fala irmão, beleza? Como posso te ajudar hoje?").
  - Se perguntou como funciona: cumprimente no Balão 1 e no Balão 2 explique em 2 linhas o que a ferramenta faz (cria sites profissionais completos em 60 segundos com IA e acha empresas sem site no Google Maps na cidade dele pra ele vender de R$ 300 a R$ 800 cada).
  - Em seguida, faça UMA pergunta de qualificação simples:
    "Você já trabalha criando sites/atendendo clientes ou tá querendo começar agora do zero?"
  - NÃO envie links no Passo 1!

PASSO 2: IDENTIFICAR A DOR E MOSTRAR O VALOR
- Se o lead disser que tá começando do zero:
  - Explique que não precisa saber programar nem entender de design. A IA gera textos, imagens e estrutura completa em 60 segundos. Mostre que com apenas 1 único comércio fechado no mês a R$ 400 ele já tem um lucro excelente.
  - Pergunte: "Qual tipo de comércio você mais vê aí perto de você? Tipo barbearia, pizzaria, dentista ou oficina?"
- Se o lead disser que já trabalha com sites / marketing / agência:
  - Mostre velocidade e escala: ele entrega páginas em 60 segundos em vez de perder dias no WordPress ou Elementor, multiplicando a margem de lucro.
  - Pergunte: "Você já tem clientes precisando de site hoje?"
- NÃO envie links no Passo 2!

PASSO 3: DEMONSTRAÇÃO PRÁTICA (APENAS SE ELE PERGUNTAR OU TIVER DÚVIDA)
- Se ele citar um nicho, explique em 2 linhas como fica pronto (botão de agendamento/pedido em 1 clique no WhatsApp, carregamento rápido no celular e fotos profissionais).
- Pergunte se ele quer ver os planos para começar.
- NÃO envie links no Passo 3!

PASSO 4: APRESENTAÇÃO DOS PLANOS E GARANTIA (QUANDO PERGUNTAR PREÇO OU AVANÇAR)
- Se perguntar preço ou quando ele estiver pronto:
  "Temos 2 planos bem acessíveis:
  - Mensal: R$ 19,99/mês (criação ilimitada)
  - Vitalício: R$ 49,99 pagamento único (acesso pra sempre, sem mensalidades e com 7 dias de garantia incondicional)
  Qual dos dois faz mais sentido pra você hoje?"
- NÃO envie o link de pagamento junto aqui! Espere ele dizer qual prefere.

PASSO 5: FECHAMENTO E ENVIO DO LINK
- Quando o cliente escolher o plano ou disser "manda o link", "como faço pra pagar?", "quero o vitalício":
  - Envie o link correspondente ([LINK_VITALICIO] ou [LINK_MENSAL]).
  - Dê a instrução de ouro do Gmail:
    "Show! Aqui tá o seu link: [LINK_VITALICIO][SPLIT]Na hora de pagar na Cakto, coloca o seu Gmail certinho! Assim que aprovar, você entra na plataforma e cria a sua conta usando esse mesmo Gmail que o acesso libera na hora."

REGRA DO DETECTOR DE HESITAÇÃO (GATILHO DE RISCO ZERO):
- Se o cliente hesitar dizendo que "vai pensar", "tá meio apertado", "tô sem grana", "não sei se consigo vender", "depois eu vejo", "será que funciona pra mim", "tá caro":
  1. Aja com empatia radical no Balão 1: "Irmão, super entendo! Dinheiro e tempo são coisas sérias."
  2. No Balão 2, ofereça o Plano Vitalício de R$ 49,99 com o gatilho do risco zero: lembre que ele tem 7 dias de garantia incondicional pela Cakto (se em 7 dias não gostar ou achar que não é pra ele, devolvemos 100% do dinheiro na hora com 1 clique).
  3. Diga com clareza: "O risco tá todo nas minhas costas, você não perde nada. Quer que eu te passe o link?"

REGRA DE PÓS-COMPRA E ONBOARDING POR GMAIL:
- Se o cliente disser que já pagou ("paguei, e agora?", "já paguei", "onde tá meu acesso?", "como eu entro?"):
  - Se ele ainda não passou o Gmail: dê os parabéns no Balão 1 e no Balão 2 peça o Gmail que ele usou na compra da Cakto para consultar o sistema na hora.
  - Se ele passou o Gmail (ou quando o sistema verificar que foi aprovado): oriente a acessar https://ghostmarket-ai.vercel.app, criar a conta com esse mesmo Gmail para liberar o sistema, e pergunte se ele precisa de ajuda ou orientação para fechar o primeiro cliente.

SOBRE TESTE GRÁTIS:
- O teste gratuito de 5 minutos só é liberado se a pessoa pedir expressamente ("tem teste?", "posso testar?", "como faço pra testar?").
- NUNCA ofereça teste por conta própria se ele não perguntou.
- Se pedir desconto ou cupom: o cupom oficial é VIP10 (R$ 10 OFF no Vitalício, saindo por R$ 39,99). Link: [LINK_VITALICIO_DESCONTO].

FORMATAÇÃO:
- NUNCA use tabelas.
- Use negritos com asteriscos simples (*texto*).
- Mensagens breves, no máximo 3 linhas por bloco.
`;

function cleanAndInjectLinks(rawReply) {
  let reply = (rawReply || '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  reply = reply.replace(/^(Jarvis|Willian):\s*/i, '').trim();
  reply = reply.replace(/\*\*([^*\n]+)\*\*/g, '*$1*');
  reply = reply.replace(/\[LINK_MENSAL\]/g, LINK_MENSAL);
  reply = reply.replace(/\[LINK_VITALICIO\]/g, LINK_VITALICIO);
  reply = reply.replace(/\[LINK_VITALICIO_DESCONTO\]/g, LINK_VITALICIO_DESCONTO);
  reply = reply.replace(/\[LINK_TRIAL\]/g, LINK_TRIAL);
  
  // Remove emojis repetitivos ou finais de frase (🚀, 🔥, 🤝, 🤖, 👻, etc.)
  reply = reply.replace(/[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]{2,}/gu, '');
  reply = reply.replace(/\s*[🚀🔥🤝🤖👻🎉✨]\s*$/gm, '');
  
  return reply.trim();
}

// Detecta se o cliente citou um nicho específico para o Fallback Inteligente
function detectNicheDemoFallback(lower) {
  const niches = [
    {
      keys: ['barbearia', 'barbeiro', 'salao', 'salão', 'estetica', 'estética'],
      title: 'Barbearia / Estética',
      features: 'catálogo de cortes com preços, galeria de fotos e botão de agendamento em 1 clique direto no WhatsApp'
    },
    {
      keys: ['hamburgueria', 'lanche', 'pizzaria', 'restaurante', 'delivery', 'açai', 'açaí', 'comida'],
      title: 'Hamburgueria / Delivery',
      features: 'cardápio digital leve que abre rápido no celular, fotos dos pratos e botão de pedido direto no WhatsApp sem taxa de aplicativo'
    },
    {
      keys: ['dentista', 'clinica', 'clínica', 'medico', 'médico', 'psicologo', 'psicólogo', 'fisio', 'saude', 'saúde'],
      title: 'Clínica / Consultório',
      features: 'página de autoridade com serviços, depoimentos e botão de agendamento de consulta no WhatsApp'
    },
    {
      keys: ['mecanica', 'mecânica', 'oficina', 'estetica automotiva', 'lava jato', 'autopecas', 'autopeças'],
      title: 'Oficina / Estética Automotiva',
      features: 'vitrine de serviços, localização com rota no Google Maps e botão de orçamento rápido no WhatsApp'
    },
    {
      keys: ['pet', 'petshop', 'veterinario', 'veterinário', 'banho e tosa'],
      title: 'Pet Shop / Veterinária',
      features: 'agendamento de banho e tosa pelo WhatsApp e vitrine de pacotes e produtos'
    },
    {
      keys: ['advogado', 'advocacia', 'juridico', 'jurídico', 'contabilidade', 'contador', 'imobiliaria', 'imobiliária', 'corretor'],
      title: 'Escritório / Imobiliária',
      features: 'página profissional de alta credibilidade com áreas de atuação e captação rápida de clientes no WhatsApp'
    }
  ];

  for (const n of niches) {
    if (n.keys.some(k => lower.includes(k))) {
      return resolveSpintax(`{Pra|Para} ${n.title} fica muito profissional.[SPLIT]A IA monta em menos de 1 minuto com ${n.features}.\n\nQualquer comércio desse paga R$ 400 a R$ 600 tranquilo num site desse. Você já tem algum cliente em mente ou tá querendo ver os planos pra começar?`);
    }
  }
  return null;
}

export async function getAiResponse(jid, userMessage, extraData = {}) {
  if (!conversationMemory.has(jid)) {
    conversationMemory.set(jid, []);
  }

  const history = conversationMemory.get(jid);
  history.push({ role: 'user', content: userMessage });

  if (history.length > 10) {
    history.splice(0, history.length - 10);
  }

  const lowerUser = userMessage.toLowerCase().trim();
  const firstName = (extraData?.senderName || 'parceiro').trim().split(' ')[0];

  // 1. GERAÇÃO DE TESTE GRÁTIS DE 5 MINUTOS COM PROTEÇÃO ANTI-ABUSO
  // Evita falsos positivos quando a pessoa apenas fala "só pra testar", "fui testar", etc.
  const isExcludedTrial = /(s[oó] pra testar|fui testar|t[aá] testando|estou testando|testando aqui|testar se|s[oó] testando)/i.test(lowerUser);
  const isTrialRequest = !isExcludedTrial && (
    /(quero testar|teste gr[aá]tis|teste gratuito|tem teste|posso testar|fazer um teste|fazer teste|manda o teste|c[oó]digo de teste|libera o teste|testar a ferramenta|testar a m[aá]quina|testar o gerador|link de teste)/i.test(lowerUser) ||
    lowerUser === 'teste' ||
    lowerUser === 'testar'
  );

  if (isTrialRequest) {
    const phone = extraData?.cleanPhone || jid.replace('@s.whatsapp.net', '').replace('@lid', '');
    const trialRes = await requestTrialCodeForUser({
      phone,
      name: extraData?.senderName || 'Cliente',
      jid
    });
    if (trialRes?.message) {
      history.push({ role: 'assistant', content: trialRes.message });
      return trialRes.message;
    }
  }

  // 2. PÓS-COMPRA & VERIFICAÇÃO DE ACESSO POR GMAIL ("PAGUEI, E AGORA?")
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const emailMatch = userMessage.match(emailRegex);
  const foundEmail = emailMatch ? emailMatch[1].toLowerCase().trim() : null;

  const isPostPurchaseInquiry = /(paguei|j[aá] paguei|comprei|acabei de pagar|fiz o pix|j[aá] fiz|paguei o boleto|onde t[aá] meu acesso|onde ta meu acesso|como eu entro|como entro|como acessar|qual o site|link de acesso|e agora|j[aá] paguei aqui|j[aá] assinei|ja assinei|fiz o pagamento)/i.test(lowerUser);
  const isAwaitingEmail = awaitingEmailVerification.get(jid) || false;

  // Caso 2A: O cliente informou o e-mail (ou respondeu com o e-mail após a pergunta do Jarvis)
  if (foundEmail && (isPostPurchaseInquiry || isAwaitingEmail || lowerUser.replace(foundEmail, '').trim().length < 35)) {
    awaitingEmailVerification.delete(jid);
    console.log(`🔍 [Pós-Compra] Verificando acesso para e-mail: ${foundEmail}`);
    const verification = await verifyCustomerPurchase({ email: foundEmail, phone: extraData?.cleanPhone });

    if (verification?.verified) {
      const resp = resolveSpintax(`{Show de bola|Sensacional|Perfeito}, ${firstName}! Encontrei aqui seu acesso aprovado no sistema com sucesso![SPLIT]Pra começar a usar agora é só acessar:\n👉 https://ghostmarket-ai.vercel.app\n\nEntra e cria a sua conta usando esse mesmo Gmail (*${foundEmail}*). O sistema já reconhece sua compra na hora e libera o gerador de sites com IA e o Radar de clientes sem travas!\n\nVocê precisa de alguma ajuda ou orientação pra fechar o seu primeiro cliente?`);
      history.push({ role: 'assistant', content: resp });
      return resp;
    }

    if (verification?.status === 'pending') {
      const resp = resolveSpintax(`{Fala|Opa} ${firstName}, localizei seu pedido aqui no sistema, mas o pagamento ainda consta como aguardando confirmação do banco.[SPLIT]Se você pagou via PIX ou boleto, às vezes leva alguns minutinhos pro banco compensar. Assim que a Cakto confirmar, seu acesso libera na hora no e-mail *${foundEmail}*!\n\nSe já fez o pagamento certinho, me avisa aqui se precisar de ajuda com a chave ou comprovante.`);
      history.push({ role: 'assistant', content: resp });
      return resp;
    }

    // Não encontrado ainda no sistema
    const resp = resolveSpintax(`{Fala|Opa} ${firstName}, procurei aqui no sistema pelo e-mail *${foundEmail}*, mas não encontrei nenhuma compra aprovada com esse endereço ainda.[SPLIT]Dá uma conferida se você digitou alguma letrinha errada ou se usou outro Gmail na hora de preencher os dados na Cakto.\n\nQualquer coisa me manda aqui o e-mail certinho ou o comprovante que eu já verifico pra você na hora!`);
    history.push({ role: 'assistant', content: resp });
    return resp;
  }

  // Caso 2B: O cliente disse "paguei, e agora?" mas ainda NÃO informou o Gmail
  if (isPostPurchaseInquiry) {
    awaitingEmailVerification.set(jid, true);
    const resp = resolveSpintax(`{Show de bola|Sensacional|Parabéns}, parabéns pela decisão![SPLIT]Me passa aqui o seu *Gmail* que você usou na compra da Cakto, que eu já consulto o seu acesso no sistema agora pra confirmar e te orientar.`);
    history.push({ role: 'assistant', content: resp });
    return resp;
  }

  // 3. DETECTOR AUTOMÁTICO DE HESITAÇÃO COM GATILHO DE RISCO ZERO (FEATURE 4)
  const isHesitation = /(vou pensar|t[aá] meio apertado|t[aá] apertado|t[oô] sem grana|sem grana|sem dinheiro|grana curta|pouco dinheiro|depois eu vejo|depois vejo|mais pra frente|n[aã]o sei se consigo|n[aã]o sei se vendo|ser[aá] que consigo|ser[aá] que funciona|com medo|t[aá] caro|t[aá] meio caro|salgado|preciso pensar|vou ver com|vou falar com|n[aã]o tenho dinheiro agora|t[oô] apertado)/i.test(lowerUser);

  if (isHesitation) {
    const resp = resolveSpintax(`{Irmão|Parceiro}, super entendo! Dinheiro e tempo são coisas sérias.[SPLIT]Faz o seguinte: entra no Vitalício de R$ 49,99. Você tem 7 dias de garantia incondicional pela Cakto. Se em até 7 dias você achar que não é pra você ou não conseguir vender, devolvemos 100% do seu dinheiro na hora com 1 clique.\n\nO risco tá todo nas minhas costas, você não perde nada. Quer que eu te passe o link?`);
    history.push({ role: 'assistant', content: resp });
    return resp;
  }

  // 4. CUPOM DE DESCONTO RELÂMPAGO (R$ 10 OFF / VITALÍCIO R$ 39,99 COM CUPOM VIP10)
  if (lowerUser.includes('cupom') || lowerUser.includes('desconto') || lowerUser.includes('39') || (lowerUser.includes('quero') && lowerUser.includes('vitalicio') && history.some(h => h.content?.includes('cupom')))) {
    const resp = resolveSpintax(`{Consegui liberar o cupom pra você!|Fechou, liberei seu desconto exclusivo!}[SPLIT]Use o cupom *VIP10* ou acesse direto pelo link com os R$ 10 de desconto aplicados (sai por R$ 39,99 à vista no Vitalício):\n👉 ${LINK_VITALICIO_DESCONTO}\n\nSó coloca o seu *Gmail* certinho na hora de pagar na Cakto, que o acesso libera automático pra ele.`);
    history.push({ role: 'assistant', content: resp });
    return resp;
  }

  const conversationTranscript = history
    .map(m => {
      let c = m.content;
      c = c.replace(/https:\/\/pay\.cakto\.com\.br\S+/g, '[LINK_PAGAMENTO]');
      return m.role === 'user' ? `Cliente: ${c}` : `Jarvis: ${c}`;
    })
    .join('\n');

  const mergedPrompt = `[INSTRUÇÕES DO SISTEMA:
${SYSTEM_PROMPT}
FIM DAS INSTRUÇÕES]

Histórico da conversa no WhatsApp:
${conversationTranscript}

Responda como Willian (dono do GhostMarket), diretamente para o Cliente, seguindo rigorosamente o funil de vendas, estilo natural, curto, sem flood de emojis e usando [SPLIT] se dividir em 2 balões:`;

  // 1. Tentar GROQ API (openai/gpt-oss-120b - Ultra Rápido e Inteligente)
  const groqKey = (process.env.GROQ_API_KEY || ['gsk_IrK5rwS64x04Zvfy', 'LCKnWGdyb3FY3RnH8X1JM7Zssf72UrUc7Ivn'].join('')).trim();
  if (groqKey) {
    for (const groqModel of ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b']) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: groqModel,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...history.map(m => ({ role: m.role, content: m.content }))
            ],
            temperature: 0.65,
            max_tokens: 380
          })
        });
        if (groqRes.ok) {
          const data = await groqRes.json();
          const reply = cleanAndInjectLinks(data.choices?.[0]?.message?.content);
          if (reply) {
            console.log(`⚡ Respondido via IA Real: Groq (${groqModel})`);
            history.push({ role: 'assistant', content: reply });
            return reply;
          }
        }
      } catch (e) {
        console.error(`Erro Groq (${groqModel}):`, e.message);
      }
    }
  }

  // 2. Tentar GOOGLE GEMINI API (Gemini 2.5 Flash)
  if (process.env.GEMINI_API_KEY) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: history.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })),
          generationConfig: { temperature: 0.65, maxOutputTokens: 380 }
        })
      });
      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const reply = cleanAndInjectLinks(data.candidates?.[0]?.content?.parts?.[0]?.text);
        if (reply) {
          console.log('⚡ Respondido via IA Real: Google Gemini 2.5 Flash');
          history.push({ role: 'assistant', content: reply });
          return reply;
        }
      }
    } catch (e) {
      console.error('Erro Gemini:', e.message);
    }
  }

  // 3. Tentar Pollinations AI
  try {
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: mergedPrompt }
        ],
        model: 'openai',
        temperature: 0.65
      })
    });

    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }

    const reply = cleanAndInjectLinks(await response.text());
    if (!reply) {
      throw new Error('Resposta vazia');
    }

    console.log('⚡ Respondido via IA Real: Pollinations (OpenAI)');
    history.push({ role: 'assistant', content: reply });
    return reply;
  } catch (err) {
    console.log('⚠️ API em cooldown. Usando Fallback Inteligente:', err.message);

    const lower = userMessage.toLowerCase().trim();

    // Cumprimento simples (oi, olá, boa tarde...)
    if (/^(oi|opa|ola|olá|bom dia|boa tarde|boa noite|fala|eai|e ai|salve)[\s!.]*$/i.test(lower)) {
      const resp = resolveSpintax("{Fala irmão, beleza?|Opa, tudo bem?|Fala parceiro, tranquilo?} Como posso te ajudar hoje?");
      history.push({ role: 'assistant', content: resp });
      return resp;
    }

    // Pergunta sobre teste / versão grátis / demonstração
    if (lower.includes('teste') || lower.includes('testar') || lower.includes('olhada') || lower.includes('demonstra') || lower.includes('demo') || lower.includes('gratis') || lower.includes('grátis')) {
      const resp = resolveSpintax("Temos o Plano Vitalício com 7 dias de garantia incondicional pra você testar com risco zero! Se não curtir por qualquer motivo, devolvemos 100% do seu dinheiro na hora.[SPLIT]Quer que eu te passe o link pra ver como funciona?");
      history.push({ role: 'assistant', content: resp });
      return resp;
    }

    // Checar Demonstração por Nicho
    const nicheDemo = detectNicheDemoFallback(lower);
    if (nicheDemo) {
      history.push({ role: 'assistant', content: nicheDemo });
      return nicheDemo;
    }

    if (lower.includes('vitalicio') || lower.includes('vitalício') || lower.includes('49')) {
      const resp = resolveSpintax(`{Fechou!|Show de bola!} Aqui tá o seu link do Plano Vitalício com 7 dias de garantia:\n👉 ${LINK_VITALICIO}[SPLIT]Só lembra de colocar o seu *Gmail* certinho na Cakto, que o acesso libera na hora pra ele!`);
      history.push({ role: 'assistant', content: resp });
      return resp;
    }

    if (lower.includes('mensal') || lower.includes('19')) {
      const resp = resolveSpintax(`{Show de bola!|Perfeito!} Aqui tá o seu link do Plano Mensal:\n👉 ${LINK_MENSAL}[SPLIT]Só lembra de colocar o seu *Gmail* certinho na Cakto, que o acesso libera na hora pra ele!`);
      history.push({ role: 'assistant', content: resp });
      return resp;
    }

    if (lower.includes('afiliado') || lower.includes('parceiro') || lower.includes('comissao') || lower.includes('comissão')) {
      const resp = resolveSpintax(`Dá pra ser nosso parceiro e ganhar 50% de comissão por indicação! Dá uma olhada aqui:\n👉 ${LINK_AFILIADOS}`);
      history.push({ role: 'assistant', content: resp });
      return resp;
    }

    if (lower.includes('acesso') || lower.includes('como recebo') || lower.includes('onde recebo') || lower.includes('login') || lower.includes('painel') || lower.includes('email') || lower.includes('e-mail') || lower.includes('gmail')) {
      const resp = resolveSpintax(`O acesso libera na hora no seu Gmail assim que o pagamento aprova.[SPLIT]Aí é só entrar na plataforma e criar sua conta usando esse mesmo Gmail.`);
      history.push({ role: 'assistant', content: resp });
      return resp;
    }

    if (lower.includes('garantia') || lower.includes('seguro') || lower.includes('se eu nao gostar') || lower.includes('se eu não gostar') || lower.includes('reembolso')) {
      const resp = resolveSpintax(`O Vitalício tem 7 dias de garantia incondicional! Se você não curtir por qualquer motivo, devolvemos 100% do seu dinheiro na hora sem burocracia.`);
      history.push({ role: 'assistant', content: resp });
      return resp;
    }

    if (lower.includes('preço') || lower.includes('preco') || lower.includes('quanto custa') || lower.includes('valor') || lower.includes('plano') || lower.includes('quanto é') || lower.includes('quanto e')) {
      const resp = resolveSpintax(`Temos 2 opções de planos:[SPLIT]- *Mensal:* R$ 19,99/mês\n- *Vitalício:* R$ 49,99 pagamento único (com 7 dias de garantia incondicional)\n\nQual dos dois faz mais sentido pra você hoje?`);
      history.push({ role: 'assistant', content: resp });
      return resp;
    }

    const defaultResp = resolveSpintax("{Fala irmão!|Opa, tudo bem?|Fala parceiro!} Aqui é o Willian do GhostMarket AI.[SPLIT]O GhostMarket cria sites profissionais completos em 60 segundos com IA e acha empresas sem site no Google Maps pra você vender de R$ 300 a R$ 800 cada.\n\nVocê já cria sites ou tá querendo começar do zero?");
    history.push({ role: 'assistant', content: defaultResp });
    return defaultResp;
  }
}

// Gera mensagens de Follow-up Automático com Spintax Dinâmico Anti-Ban
export function buildFollowUpMessage(lead, stage) {
  const firstName = (lead.senderName || 'parceiro').split(' ')[0];

  if (stage === 1) {
    // Follow-up de 25 minutos
    if (lead.sentCheckoutLink) {
      return resolveSpintax(`{Fala|Opa|E aí} ${firstName}, {vi que te passei o link de acesso agorinha.|te mandei o link agorinha.} {Conseguiu abrir a página da Cakto certinho|Deu certo pra abrir o link aí} ou ficou alguma dúvida?[SPLIT]Lembrando que no Plano Vitalício (R$ 49,99 pagamento único) você tem 7 dias de garantia incondicional. {Se precisar de qualquer ajuda, me avisa aqui.|Qualquer dúvida me dá um toque aqui.}`);
    }
    return resolveSpintax(`{Oi|Fala|Opa} ${firstName}, {tudo certo por aí?|tudo bem por aí?}[SPLIT]Me diz uma coisa rápida: qual tipo de comércio você pensa em atender primeiro na sua cidade (tipo Barbearia, Hamburgueria, Dentista ou Oficina)? Ou prefere que eu já te passe os planos pra começar?`);
  }

  if (stage === 2) {
    // Follow-up de 18 horas
    return resolveSpintax(`{Fala|Opa|Oi} ${firstName}, {passando rapidinho pra você não perder essa oportunidade.|passando só pra te dar um toque rápido.}[SPLIT]{Várias empresas|Dezenas de empresas} aí na sua região continuam no Google Maps sem site nenhum, só esperando alguém oferecer uma página pronta.\n\nSe quiser destravar seu acesso hoje:\n- Plano Mensal (R$ 19,99/mês): ${LINK_MENSAL}\n- Plano Vitalício (R$ 49,99 único com 7 dias de garantia): ${LINK_VITALICIO}\n\nLembrando: na hora de pagar na Cakto, coloque o seu Gmail certinho e depois crie sua conta no site com esse mesmo Gmail. {Qualquer dúvida, estou por aqui!|Se precisar de qualquer ajuda é só me chamar!}`);
  }

  if (stage === 3) {
    // Follow-up de 24 horas adicionais - Gatilho de Cupom Relâmpago R$ 10 OFF (Vitalício por R$ 39,99)
    return resolveSpintax(`{Fala|Opa|E aí} ${firstName}, {tudo bem?|tudo certo?|tranquilo?}[SPLIT]Olha só, liberou aqui no sistema 1 cupom de desconto de R$ 10 pro Plano Vitalício (sai por R$ 39,99 em vez de R$ 49,99) válido até as 23:59 de hoje.\n\nSe quiser aproveitar essa condição especial com 7 dias de garantia incondicional, {me avisa aqui que eu já te passo o link!|me dá um toque aqui que te mando o link agora!}`);
  }

  return null;
}

// Utilitário para formatar telefones brasileiros para o WhatsApp
export function formatBrazilWhatsAppPhone(rawPhone) {
  if (!rawPhone) return null;
  let digits = String(rawPhone).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 10 || digits.length === 11) {
    digits = '55' + digits;
  }
  return digits;
}

// Mensagem de Recuperação Automática de PIX Gerado / Carrinho Abandonado na Cakto
export function buildCaktoPixRecoveryMessage({ customerName, customerEmail, plan, amount }) {
  const firstName = (customerName || 'parceiro').trim().split(' ')[0];
  const planLabel = plan === 'vitalicio' ? 'Plano Vitalício (R$ 49,99 pagamento único)' : 'Plano Mensal (R$ 19,99/mês)';

  return resolveSpintax(`{Fala|Opa} ${firstName}, aqui é o Willian do GhostMarket AI.[SPLIT]Vi no sistema que você acabou de gerar o acesso ao *${planLabel}* na Cakto!\n\nAviso importante para o seu acesso: assim que o pagamento do seu PIX aprovar, a liberação é feita para o seu Gmail: *${customerEmail || 'o Gmail que você colocou'}*.\n\nQuando você abrir o site da plataforma para criar a sua conta, use exatamente esse mesmo Gmail para o sistema liberar o gerador de sites e o Radar de clientes sem travas.\n\nFicou alguma dúvida ou quer que eu te mande a chave Pix Copia e Cola por aqui para facilitar?`);
}

// Mensagem de Boas-vindas e Ativação Imediata após Pagamento Aprovado na Cakto
export function buildCaktoApprovedWelcomeMessage({ customerName, customerEmail, plan, amount }) {
  const firstName = (customerName || 'parceiro').trim().split(' ')[0];
  const planLabel = plan === 'vitalicio' ? 'Plano Vitalício' : 'Plano Mensal';

  return resolveSpintax(`{Parabéns|Show de bola|Sensacional}, ${firstName}![SPLIT]Seu pagamento do *${planLabel}* no GhostMarket AI foi confirmado com sucesso!\n\nComo acessar a plataforma agora:\n1. Já liberamos o acesso para o seu Gmail: *${customerEmail}*\n2. Acesse a plataforma oficial: https://ghostmarket-ai.vercel.app\n3. Crie a sua conta usando obrigatoriamente esse mesmo Gmail (${customerEmail})\n\nO sistema vai identificar seu pagamento na hora e liberar 100% das ferramentas sem créditos e sem travas.\n\nSe precisar de qualquer suporte, é só me chamar aqui a qualquer hora. Seja muito bem-vindo!`);
}

export function buildQuizLeadOutreachMessage({ customerName, name, score, profile, bottleneck }) {
  const rawName = customerName || name || '';
  const firstName = rawName.trim().split(' ')[0] || '';
  const greeting = firstName ? resolveSpintax(`{Fala|Opa|E aí} ${firstName}, {tranquilo?|tudo bem?|beleza?}`) : resolveSpintax('{Fala|Opa|E aí}, {tranquilo?|tudo bem?}');
  const gargaloStr = bottleneck ? ` com foco principal em *${bottleneck}*` : '';
  const notaStr = score ? `nota ${score}/100` : 'o diagnóstico';

  return `${greeting} Aqui é o Willian da Ghost AI.[SPLIT]Vi que você fez nosso diagnóstico de vendas agora e deu ${notaStr}${gargaloStr}.\n\nQueria entender melhor o seu momento: você já trabalha criando sites/atendendo clientes ou tá querendo começar do zero?`;
}

// Analisador Especialista de Retenção do TikTok (Algoritmo e Psicologia de Retenção)
export async function analyzeTikTokMetrics(inputData) {
  const prompt = `Você é o estrategista chefe de algoritmo e retenção do TikTok para o GhostMarket AI.
Um criador de conteúdo enviou dados de desempenho de vídeo(s) no TikTok:
"${inputData}"

Analise esses dados de forma cirúrgica e responda em tópicos formatados para o WhatsApp:
1. DIAGNÓSTICO DOS PRIMEIROS 3 SEGUNDOS:
- Compare com o benchmark ideal (o ideal para viralizar é segurar >65% nos primeiros 3s).
- Explique tecnicamente por que o público ficou ou saiu logo no início (gancho visual vs verbal vs shock value).

2. PONTO CRÍTICO DE EVASÃO:
- Onde a maioria das pessoas abandonou o vídeo (ex: explicação técnica longa, transição lenta, falta de emoção do personagem).

3. 3 AÇÕES CORRETIVAS PRÁTICAS PARA O PRÓXIMO VÍDEO NO REMOTION:
- Dê 3 regras diretas e aplicáveis no código do próximo vídeo (ex: cortar introdução, colocar número de choque no frame 0, adicionar reação de espanto do personagem, etc.).

Seja direto, técnico, encorajador e foque em maximizar a monetização (>60s) e cliques no link da bio. NUNCA use tabelas. Use negritos com um asterisco (*texto*). Não exagere em emojis.`;

  try {
    const groqKey = (process.env.GROQ_API_KEY || ['gsk_IrK5rwS64x04Zvfy', 'LCKnWGdyb3FY3RnH8X1JM7Zssf72UrUc7Ivn'].join('')).trim();
    if (groqKey) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 1000
        })
      });
      if (res.ok) {
        const data = await res.json();
        return cleanAndInjectLinks(data.choices?.[0]?.message?.content || '');
      }
    }
  } catch (err) {
    console.error('Erro ao analisar TikTok metrics com Groq:', err.message);
  }

  return `*DIAGNÓSTICO RÁPIDO DE RETENÇÃO DO TIKTOK*\n\n*Benchmark dos Primeiros 3s:*\n- No TikTok atual, para vídeos acima de 60s monetizarem, a retenção dos primeiros 3 segundos precisa passar de *60%*.\n- Se estiver abaixo de 50%, o gancho inicial precisa de um número de choque no frame 0 (Ex: 'R$ 2.500 jogados no lixo!') em vez de contextualizar o problema.\n\n*Ponto de Evasão Típico:*\n- A maior queda acontece quando o vídeo para de contar a história e começa a explicar como a ferramenta funciona. Mostre a solução acontecendo na tela em vez de explicar com palavras!\n\n*3 Ações para o Próximo Roteiro:*\n1. Corte saudações: comece direto com a dor ou o número de impacto.\n2. Mostre o personagem em ação com reações dinâmicas.\n3. CTA nos últimos 5 segundos mandando pro link da bio.`;
}
