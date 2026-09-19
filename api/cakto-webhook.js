import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle newlines in private key securely
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin Init Error:', error);
  }
}

const db = getFirestore();

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = req.body;
    console.log('Webhook received:', payload);

    // Log the raw payload for debugging (especially for affiliate data)
    try {
      await db.collection('webhook_logs').add({
        payload: payload,
        receivedAt: FieldValue.serverTimestamp()
      });
    } catch (logErr) {
      console.error("Error logging webhook:", logErr);
    }

    // Ajuste para o modelo exato da Cakto:
    // O email está em payload.data.customer.email
    // O evento está em payload.event (ex: "purchase_approved")
    const customerEmail = payload?.data?.customer?.email || payload?.customer?.email || payload?.email;
    const eventType = payload?.event || payload?.status;

    if (!customerEmail) {
      return res.status(400).json({ error: 'Email not found in payload' });
    }

    // A Cakto envia "purchase_approved" para compras aprovadas
    if (eventType === 'purchase_approved' || eventType === 'approved' || eventType === 'paid') {
      // 1. Libera o acesso para o cliente (lead) usar o SaaS
      await db.collection('allowed_users').doc(customerEmail).set({
        email: customerEmail,
        status: 'approved',
        createdAt: FieldValue.serverTimestamp(),
        used: false,
      });

      // Envia uma notificação de boas-vindas para o cliente
      await db.collection('notifications').add({
        userId: customerEmail,
        title: 'Bem-vindo ao GhostMarket AI!',
        text: 'Sua conta foi ativada com sucesso. Comece explorando a aba Creator IA.',
        unread: true,
        createdAt: FieldValue.serverTimestamp()
      });

      // 2. Salva a venda para aparecer no SEU gráfico de Admin
      const amount = payload?.data?.transaction?.amount || payload?.data?.amount || 0;
      const clientName = payload?.data?.customer?.name || payload?.customer?.name || "Novo Cliente (SaaS)";
      
      await db.collection('transactions').add({
        userId: 'willrandrier@gmail.com', // ID do dono do SaaS
        clientName: clientName,
        clientEmail: customerEmail,
        amount: Number(amount),
        status: 'Aprovado',
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: FieldValue.serverTimestamp(),
        source: 'Assinatura SaaS'
      });

      return res.status(200).json({ success: true, message: 'User allowed, notification sent, and transaction saved' });
    }

    return res.status(200).json({ success: true, message: 'Ignored non-approved status' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
