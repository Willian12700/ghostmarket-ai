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

// Notifica o atendente Jarvis no Moto G60 em tempo real (Recuperação de PIX + Boas-vindas)
async function notifyJarvisMotoG60(eventData) {
  const tunnelBase = process.env.MOTO_G60_TUNNEL_URL || 'https://exposed-leadership-gaps-stopped.trycloudflare.com';
  const targetUrl = `${tunnelBase.replace(/\/+$/, '')}/api/cakto-event`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

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
    // Na Cakto, valores podem vir em centavos (ex: 2990 = R$ 29.90 ou 4990 = R$ 49.90)
    if (rawAmount >= 1000 && !payload?.data?.transaction?.amount) {
      rawAmount = rawAmount / 100;
    }
    const amount = rawAmount;

    const offerName = String(payload?.data?.offer?.name || payload?.data?.product?.name || payload?.product_name || payload?.data?.productName || '').toLowerCase();
    const detectedPlan = (amount >= 39 || offerName.includes('vital') || offerName.includes('elite') || offerName.includes('49')) ? 'vitalicio' : 'mensal';

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
          amount,
          status: 'Aprovado',
          date: new Date().toLocaleDateString('pt-BR'),
          timestamp: serverTimestamp(),
          source: 'Assinatura SaaS'
        });
      }

      // Disparar WhatsApp no Moto G60
      await notifyJarvisMotoG60({
        eventType: 'purchase_approved',
        customerName,
        customerEmail,
        customerPhone,
        amount,
        plan: detectedPlan,
        pixCode
      });

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
