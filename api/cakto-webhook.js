import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDafvRbIgwriRgCis2sAmJeJ80RHmn30LA",
  authDomain: "ghostmarket-ai-2cc26.firebaseapp.com",
  projectId: "ghostmarket-ai-2cc26",
  storageBucket: "ghostmarket-ai-2cc26.firebasestorage.app",
  messagingSenderId: "127761760560",
  appId: "1:127761760560:web:78f323a283351f342908f5"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const CALLMEBOT_PHONE = '558496656016';
const CALLMEBOT_APIKEY = '1083057';

export async function sendCallMeBotAlert(text) {
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_PHONE}&text=${encodeURIComponent(text)}&apikey=${CALLMEBOT_APIKEY}`;
    const res = await fetch(url);
    console.log(`[CallMeBot Alert] Status: ${res.status}`);
  } catch (err) {
    console.error(`[CallMeBot Alert] Erro: ${err.message}`);
  }
}

// Notifica o atendente Jarvis no Moto G60 em tempo real (Recuperação de PIX + Boas-vindas)
async function notifyJarvisMotoG60(eventData) {
  const tunnelBase = process.env.MOTO_G60_TUNNEL_URL || 'https://preceding-notifications-meal-dollar.trycloudflare.com';
  const targetUrl = `${tunnelBase.replace(/\/+$/, '')}/api/cakto-event`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ghost-secret': 'ghost_ota_2026'
      },
      body: JSON.stringify({
        secret: 'ghost_ota_2026',
        ...eventData
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    console.log(`[Jarvis Webhook Forward] Status: ${response.status}`);
  } catch (err) {
    console.warn(`[Jarvis Webhook Forward] Não foi possível contatar o Moto G60 no momento (${err.message}).`);
    // Envia alerta de queda diretamente para o WhatsApp pessoal do Willian
    await sendCallMeBotAlert(`🚨 *ALERTA GHOSTMARKET (JARVIS OFFLINE)*\n\nO servidor no Moto G60 não respondeu ao webhook!\n⚠️ *Evento:* ${eventData.eventType}\n👤 *Cliente:* ${eventData.customerName || 'N/A'}\n💵 *Valor:* R$ ${eventData.amount || 0}\n\nO acesso no SaaS foi liberado, mas o envio no WhatsApp pelo Jarvis falhou. Verifique se o celular está ligado e o Termux ativo!`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = req.body || {};
    console.log('Webhook Cakto recebido:', JSON.stringify(payload));

    try {
      await addDoc(collection(db, 'webhook_logs'), {
        payload,
        receivedAt: serverTimestamp()
      });
    } catch (logErr) {
      console.error("Erro ao registrar log do webhook:", logErr.message);
    }

    const rawEmail = payload?.data?.customer?.email || payload?.customer?.email || payload?.email || '';
    const customerEmail = String(rawEmail).toLowerCase().trim();

    const rawPhone = payload?.data?.customer?.phone || payload?.data?.customer?.cellphone || payload?.data?.customer?.mobile || payload?.customer?.phone || payload?.data?.phone || payload?.phone || '';
    const customerPhone = String(rawPhone).trim();

    const rawName = payload?.data?.customer?.name || payload?.customer?.name || payload?.data?.name || payload?.name || 'Cliente';
    const customerName = String(rawName).trim();

    let rawAmount = Number(payload?.data?.amount || payload?.data?.total || payload?.data?.transaction?.amount || payload?.amount || 0);
    // Na Cakto, valores podem vir em centavos (ex: 1999 = R$ 19.99 ou 4999 = R$ 49.99)
    if (rawAmount >= 1000 && !payload?.data?.transaction?.amount) {
      rawAmount = rawAmount / 100;
    }
    const amount = rawAmount;

    const offerName = String(payload?.data?.offer?.name || payload?.data?.product?.name || payload?.product_name || payload?.data?.productName || '').toLowerCase();
    const detectedPlan = (amount >= 39 || offerName.includes('vital') || offerName.includes('elite') || offerName.includes('49') || offerName.includes('anual')) ? 'vitalicio' : 'mensal';

    // -------------------------------------------------------------
    // EXTRAÇÃO INTELIGENTE DE AFILIADO & DIVISÃO DE COMISSÕES (CAKTO)
    // -------------------------------------------------------------
    const commissions = Array.isArray(payload?.data?.commissions) 
      ? payload.data.commissions 
      : (Array.isArray(payload?.commissions) ? payload.commissions : []);

    const affiliateComm = commissions.find(c => (c.type || c.role || '').toLowerCase() === 'affiliate');
    const producerComm = commissions.find(c => (c.type || c.role || '').toLowerCase() === 'producer');

    const rawAffiliate = payload?.data?.affiliate || payload?.affiliate || payload?.data?.partner || null;
    let isAffiliate = Boolean(affiliateComm || rawAffiliate);
    let affiliateName = '';
    let affiliateEmail = '';
    let affiliateCommission = 0;

    if (affiliateComm) {
      isAffiliate = true;
      affiliateName = affiliateComm.name || affiliateComm.user || 'Afiliado';
      affiliateEmail = affiliateComm.email || (typeof affiliateComm.user === 'string' && affiliateComm.user.includes('@') ? affiliateComm.user : '');
      affiliateCommission = Number(affiliateComm.totalAmount || affiliateComm.amount || 0);
    } else if (rawAffiliate) {
      isAffiliate = true;
      if (typeof rawAffiliate === 'string') {
        affiliateName = rawAffiliate;
        affiliateEmail = rawAffiliate.includes('@') ? rawAffiliate : '';
      } else if (typeof rawAffiliate === 'object') {
        affiliateName = rawAffiliate.name || rawAffiliate.email || rawAffiliate.id || 'Afiliado';
        affiliateEmail = rawAffiliate.email || '';
        affiliateCommission = Number(rawAffiliate.commission || rawAffiliate.amount || 0);
      }
    }

    // Regras de Preço e Líquido GhostMarket:
    // Mensal: R$ 19,99 bruto -> Líquido direto produtor: R$ 16,51 (taxa Cakto R$ 3,48)
    // Vitalício: R$ 49,99 bruto -> Líquido direto produtor: R$ 46,51 (taxa Cakto R$ 3,48)
    const defaultGross = detectedPlan === 'vitalicio' ? 49.99 : 19.99;
    const defaultDirectNet = detectedPlan === 'vitalicio' ? 46.51 : 16.51;

    const grossAmount = amount > 0 ? amount : defaultGross;

    let netAmount = defaultDirectNet;
    if (producerComm && Number(producerComm.totalAmount || 0) > 0) {
      // Valor líquido oficial exato enviado pela Cakto para o produtor
      netAmount = Number(producerComm.totalAmount);
    } else if (isAffiliate && affiliateCommission > 0) {
      // Subtrai a comissão do afiliado da fatia líquida
      netAmount = Math.max(0, Number((defaultDirectNet - affiliateCommission).toFixed(2)));
    } else if (isAffiliate) {
      // Caso a Cakto envie porcentagem de afiliado sem valor fixo
      const affPercent = affiliateComm?.percentage || payload?.data?.affiliate_percent || 0;
      if (affPercent > 0) {
        affiliateCommission = Number((defaultDirectNet * (affPercent / 100)).toFixed(2));
        netAmount = Number((defaultDirectNet - affiliateCommission).toFixed(2));
      }
    }

    const pixCode = (
      payload?.data?.pix?.qrCode ||
      payload?.data?.pix?.qrcode ||
      payload?.data?.pix?.qr_code ||
      payload?.data?.payment?.pix?.qrCode ||
      payload?.data?.transaction?.pix_code ||
      payload?.data?.pix_code ||
      payload?.pix_code ||
      payload?.data?.transaction?.pix_qr_code ||
      ''
    );
    const eventType = String(payload?.event || payload?.status || payload?.type || '').toLowerCase().trim();

    if (!customerEmail && !customerPhone) {
      return res.status(400).json({ error: 'Nenhum e-mail ou telefone identificado no payload' });
    }

    // 1. Pagamento Aprovado (Liberação Imediata no SaaS + Notificação no WhatsApp do Cliente e do Dono)
    if (eventType === 'purchase_approved' || eventType === 'approved' || eventType === 'paid') {
      if (customerEmail) {
        await setDoc(doc(db, 'allowed_users', customerEmail), {
          email: customerEmail,
          status: 'approved',
          plan: detectedPlan,
          grossAmount,
          netAmount,
          isAffiliate,
          affiliateName,
          affiliateEmail,
          affiliateCommission,
          createdAt: serverTimestamp(),
          grantedAt: new Date().toISOString(),
          used: false,
        }, { merge: true });

        await addDoc(collection(db, 'notifications'), {
          userId: customerEmail,
          title: 'Bem-vindo ao GhostMarket AI!',
          text: 'Sua conta foi ativada com sucesso. Comece explorando a aba Creator IA.',
          unread: true,
          createdAt: serverTimestamp()
        });

        await addDoc(collection(db, 'transactions'), {
          userId: 'willrandrier@gmail.com',
          clientName: customerName,
          clientEmail: customerEmail,
          amount: grossAmount,
          netAmount,
          status: 'Aprovado',
          plan: detectedPlan,
          isAffiliate,
          affiliateName,
          affiliateCommission,
          date: new Date().toLocaleDateString('pt-BR'),
          timestamp: serverTimestamp(),
          source: isAffiliate ? `Afiliado: ${affiliateName}` : 'Venda Direta'
        });
      }

      // Disparar WhatsApp no Moto G60
      await notifyJarvisMotoG60({
        eventType: 'purchase_approved',
        customerName,
        customerEmail,
        customerPhone,
        amount: grossAmount,
        netAmount,
        plan: detectedPlan,
        isAffiliate,
        affiliateName,
        affiliateEmail,
        affiliateCommission,
        pixCode
      });

      // Notifica o dono diretamente no WhatsApp via CallMeBot
      const originAlert = isAffiliate
        ? `🤝 *Venda por Afiliado:*\n   • *Afiliado:* ${affiliateName} ${affiliateEmail ? `(${affiliateEmail})` : ''}\n   • *Comissão Afiliado:* R$ ${affiliateCommission.toFixed(2)}`
        : `🏷️ *Origem:* Venda Direta (Sua - 100% Produtor)`;

      await sendCallMeBotAlert(
        `🎉 *NOVA VENDA CONFIRMADA NO GHOSTMARKET!* 💰\n\n` +
        `👤 *Cliente:* ${customerName}\n` +
        `📧 *E-mail:* ${customerEmail}\n` +
        `📱 *WhatsApp:* ${customerPhone || 'N/A'}\n` +
        `📦 *Plano:* ${detectedPlan.toUpperCase()}\n` +
        `💵 *Valor Bruto:* R$ ${grossAmount.toFixed(2)}\n` +
        `💚 *LÍQUIDO NO BOLSO (VOCÊ RECEBE):* R$ ${netAmount.toFixed(2)}\n\n` +
        `${originAlert}\n\n` +
        `✅ *Acesso liberado no sistema!*`
      );

      return res.status(200).json({
        success: true,
        message: 'Acesso liberado, transação salva e Jarvis notificado com sucesso'
      });
    }

    // 2. PIX Gerado / Aguardando Pagamento / Carrinho Abandonado (Recuperação Automática pelo Jarvis)
    const isPendingPayment = (
      eventType === 'pix_gerado' ||
      eventType === 'checkout_abandonment' ||
      eventType === 'waiting_payment' ||
      eventType === 'pix_generated' ||
      eventType === 'pix_created' ||
      eventType === 'pending' ||
      eventType === 'cart_abandoned' ||
      eventType === 'checkout_abandoned' ||
      eventType === 'abandoned_cart' ||
      eventType === 'boleto_gerado' ||
      eventType === 'billet_created' ||
      eventType === 'purchase_refused' ||
      eventType === 'refused'
    );

    if (isPendingPayment) {
      await notifyJarvisMotoG60({
        eventType: 'waiting_payment',
        customerName,
        customerEmail,
        customerPhone,
        amount,
        plan: detectedPlan,
        pixCode
      });

      // Notifica o dono diretamente no WhatsApp via CallMeBot
      await sendCallMeBotAlert(`⚡ *NOVO PIX GERADO NA CAKTO* 🛒\n\n👤 *Cliente:* ${customerName}\n📱 *WhatsApp:* ${customerPhone || 'N/A'}\n💵 *Valor:* R$ ${amount}\n📦 *Plano:* ${detectedPlan.toUpperCase()}\n\n🤖 Jarvis acionado para recuperação automática!`);

      return res.status(200).json({
        success: true,
        message: 'Evento pendente recebido e Jarvis acionado para recuperação automática'
      });
    }

    // 3. Reembolso ou Cancelamento
    if (
      eventType === 'refunded' ||
      eventType === 'purchase_refunded' ||
      eventType === 'chargedback' ||
      eventType === 'chargeback' ||
      eventType === 'canceled' ||
      eventType === 'subscription_canceled'
    ) {
      if (customerEmail) {
        await setDoc(doc(db, 'allowed_users', customerEmail), {
          email: customerEmail,
          status: 'suspended',
          suspendedReason: eventType,
          suspendedAt: new Date().toISOString()
        }, { merge: true });
      }

      return res.status(200).json({ success: true, message: 'Acesso suspenso por cancelamento/reembolso' });
    }

    return res.status(200).json({ success: true, message: 'Status registrado' });
  } catch (error) {
    console.error('Erro no processamento do webhook Cakto:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.toString() });
  }
}
