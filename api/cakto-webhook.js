import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDafvRbIgwriRgCis2sAmJeJ80RHmn30LA",
  authDomain: "ghostmarket-ai-2cc26.firebaseapp.com",
  projectId: "ghostmarket-ai-2cc26",
  storageBucket: "ghostmarket-ai-2cc26.firebasestorage.app",
  messagingSenderId: "127761760560",
  appId: "1:127761760560:web:78f323a283351f342908f5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = req.body;
    console.log('Webhook received:', payload);

    try {
      await addDoc(collection(db, 'webhook_logs'), {
        payload: payload,
        receivedAt: serverTimestamp()
      });
    } catch (logErr) {
      console.error("Error logging webhook:", logErr);
    }

    const rawEmail = payload?.data?.customer?.email || payload?.customer?.email || payload?.email;
    const customerEmail = rawEmail ? String(rawEmail).toLowerCase().trim() : '';
    const eventType = String(payload?.event || payload?.status || '').toLowerCase().trim();

    if (!customerEmail) {
      return res.status(400).json({ error: 'Email not found in payload' });
    }

    if (eventType === 'purchase_approved' || eventType === 'approved' || eventType === 'paid') {
      const amount = Number(payload?.data?.transaction?.amount || payload?.data?.amount || payload?.amount || 0);
      const offerName = String(payload?.data?.offer?.name || payload?.data?.product?.name || '').toLowerCase();
      const detectedPlan = amount >= 90 || offerName.includes('vital') || offerName.includes('elite') ? 'vitalicio' : 'mensal';

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

      const clientName = payload?.data?.customer?.name || payload?.customer?.name || "Novo Cliente (SaaS)";
      
      await addDoc(collection(db, 'transactions'), {
        userId: 'willrandrier@gmail.com',
        clientName: clientName,
        clientEmail: customerEmail,
        amount: amount,
        status: 'Aprovado',
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: serverTimestamp(),
        source: 'Assinatura SaaS'
      });

      return res.status(200).json({ success: true, message: 'User allowed, notification sent, and transaction saved' });
    }

    // Revoke access automatically on refund, chargeback, or subscription cancellation
    if (
      eventType === 'refunded' ||
      eventType === 'purchase_refunded' ||
      eventType === 'chargedback' ||
      eventType === 'chargeback' ||
      eventType === 'canceled' ||
      eventType === 'subscription_canceled'
    ) {
      await setDoc(doc(db, 'allowed_users', customerEmail), {
        email: customerEmail,
        status: 'suspended',
        suspendedReason: eventType,
        suspendedAt: new Date().toISOString()
      }, { merge: true });

      return res.status(200).json({ success: true, message: 'User access suspended due to cancellation/refund' });
    }

    return res.status(200).json({ success: true, message: 'Ignored non-approved status' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.toString() });
  }
}
