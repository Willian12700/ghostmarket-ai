import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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

function formatBrazilPhone(rawPhone) {
  if (!rawPhone) return '';
  let digits = String(rawPhone).replace(/\D/g, '');
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 10 || digits.length === 11) {
    digits = '55' + digits;
  }
  return digits;
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await ensureAuth();

    const rawPhone = req.body?.phone || req.query?.phone;
    const cleanPhone = formatBrazilPhone(rawPhone);
    const name = req.body?.name || req.query?.name || 'Lead WhatsApp';
    const jid = req.body?.jid || req.query?.jid || null;
    const secret = req.headers['x-ghost-secret'] || req.body?.secret || req.query?.secret;

    if (secret !== 'ghost_ota_2026') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Telefone inválido' });
    }

    // 1. Medida Protetiva Anti-Abuso: Checar se o número já solicitou teste anteriormente
    const requestDocRef = doc(db, 'trial_requests', cleanPhone);
    const requestSnap = await getDoc(requestDocRef);

    if (requestSnap.exists()) {
      const data = requestSnap.data();
      return res.status(200).json({
        success: false,
        alreadyUsed: true,
        message: 'Este número de WhatsApp já resgatou o teste gratuito de 5 minutos.',
        previousCode: data.code,
        grantedAt: data.createdAt
      });
    }

    // 2. Gerar código único de 6 dígitos
    let code = '';
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 5) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeSnap = await getDoc(doc(db, 'trial_codes', code));
      exists = codeSnap.exists();
      attempts++;
    }

    const now = Date.now();
    const validUntil = now + (20 * 60 * 1000); // 20 minutos para ativar no site

    // 3. Salvar o código em trial_codes (mesma coleção do painel admin/sócio)
    await setDoc(doc(db, 'trial_codes', code), {
      code,
      createdAt: serverTimestamp(),
      activatedAt: null,
      uid: null,
      expiresAt: null,
      durationMinutes: 5,
      validUntil,
      phone: cleanPhone,
      name,
      jid,
      source: 'whatsapp_jarvis'
    });

    // 4. Bloquear o número para nunca mais solicitar outro teste gratuito
    await setDoc(requestDocRef, {
      phone: cleanPhone,
      name,
      jid,
      code,
      createdAt: serverTimestamp(),
      used: true
    });

    return res.status(200).json({
      success: true,
      alreadyUsed: false,
      code,
      durationMinutes: 5,
      validMinutes: 20,
      trialUrl: 'https://ghostmarket-ai.vercel.app/trial'
    });
  } catch (err) {
    console.error('Erro ao gerar código de teste:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
