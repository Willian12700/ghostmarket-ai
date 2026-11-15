import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

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
const auth = getAuth(app);

async function ensureAuth() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-ghost-secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const emailRaw = req.query.email || req.body?.email || '';
  const phoneRaw = req.query.phone || req.body?.phone || '';

  const email = String(emailRaw).trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'E-mail inválido ou não informado' });
  }

  try {
    await ensureAuth();

    // 1. Checar na coleção allowed_users (onde compras aprovadas são salvas com doc ID = email)
    const userDocRef = doc(db, 'allowed_users', email);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      const isApproved = data.status === 'approved' || data.status === 'paid' || data.status === 'ativo';

      return res.status(200).json({
        verified: isApproved,
        status: isApproved ? 'approved' : (data.status || 'pending'),
        plan: data.plan || 'vitalicio',
        email: data.email || email,
        customerName: data.name || data.customerName || '',
        grantedAt: data.grantedAt || null
      });
    }

    // 2. Fallback: procurar na coleção transactions por clientEmail
    try {
      const transRef = collection(db, 'transactions');
      const q = query(transRef, where('clientEmail', '==', email), limit(3));
      const transSnap = await getDocs(q);

      if (!transSnap.empty) {
        const transDocs = transSnap.docs.map(d => d.data());
        const approvedTrans = transDocs.find(t => String(t.status).toLowerCase().includes('aprovado') || String(t.status).toLowerCase().includes('approved'));

        if (approvedTrans) {
          return res.status(200).json({
            verified: true,
            status: 'approved',
            plan: approvedTrans.plan || 'vitalicio',
            email,
            customerName: approvedTrans.clientName || '',
            amount: approvedTrans.amount || null
          });
        }

        // Se encontrou transação mas pendente
        return res.status(200).json({
          verified: false,
          status: 'pending',
          email,
          customerName: transDocs[0]?.clientName || '',
          amount: transDocs[0]?.amount || null
        });
      }
    } catch (transErr) {
      console.warn('Erro ao consultar transactions:', transErr.message);
    }

    // 3. Não encontrado
    return res.status(200).json({
      verified: false,
      notFound: true,
      email
    });
  } catch (err) {
    console.error('Erro ao verificar compra por e-mail:', err);
    return res.status(500).json({ error: 'Erro interno ao consultar banco de dados', details: err.message });
  }
}
