import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin Init Error:', error);
  }
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // O ID (e-mail) do cliente que é DONO do webhook é passado na URL (ex: ?user=email@gmail.com)
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: 'User identifier is required in query parameters' });
  }

  try {
    const payload = req.body;
    console.log(`Webhook recebido para o cliente ${user}:`, payload);

    // Mapeamento genérico para tentar pegar dados da Cakto, Kiwify, etc.
    const eventType = payload?.event || payload?.status || payload?.type;
    const amount = payload?.data?.transaction?.amount || payload?.data?.amount || payload?.amount || 0;
    const clientName = payload?.data?.customer?.name || payload?.customer?.name || payload?.buyer?.name || "Novo Cliente";
    
    // Na Kiwify e na Cakto, geralmente é "purchase_approved" ou "approved"
    if (eventType === 'purchase_approved' || eventType === 'approved' || eventType === 'paid') {
      
      // Salva a transação vinculada ao usuário correto (o dono do SaaS logado)
      await db.collection('transactions').add({
        userId: user, // Esse campo é o que filtra os dados no Dashboard do cliente!
        clientName: clientName,
        amount: Number(amount),
        status: 'Aprovado',
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        source: 'Webhook'
      });

      return res.status(200).json({ success: true, message: 'Transaction registered successfully!' });
    }

    return res.status(200).json({ success: true, message: 'Ignored non-approved status' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
