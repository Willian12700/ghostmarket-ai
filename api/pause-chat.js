import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
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

function getBrazilPhonePairs(digits) {
  const clean = String(digits).replace(/\D/g, '');
  const pairs = [clean];
  let ddd = '';
  let rest = '';
  if (clean.startsWith('55') && (clean.length === 12 || clean.length === 13)) {
    ddd = clean.slice(2, 4);
    rest = clean.slice(4);
  } else if (!clean.startsWith('55') && (clean.length === 10 || clean.length === 11)) {
    ddd = clean.slice(0, 2);
    rest = clean.slice(2);
  }
  if (ddd && rest) {
    const with9 = rest.length === 9 ? rest : ('9' + rest);
    const without9 = rest.length === 9 ? rest.slice(1) : rest;
    pairs.push(`55${ddd}${with9}`);
    pairs.push(`55${ddd}${without9}`);
  }
  return Array.from(new Set(pairs));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const tunnelBase = process.env.MOTO_G60_TUNNEL_URL || 'https://preceding-notifications-meal-dollar.trycloudflare.com';

  try {
    await ensureAuth();

    const action = req.body?.action || req.query?.action || (req.method === 'GET' ? 'list' : 'pause');
    const rawPhone = req.body?.phone || req.query?.phone;
    const cleanPhone = formatBrazilPhone(rawPhone);
    const reason = req.body?.reason || req.query?.reason || 'Manual via Painel';

    // 1. Listar números pausados
    if (action === 'list') {
      const snap = await getDocs(collection(db, 'paused_chats'));
      const items = {};
      snap.docs.forEach(d => {
        items[d.id] = d.data();
      });
      return res.status(200).json({ success: true, count: snap.docs.length, pausedChats: items });
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Telefone inválido ou não informado' });
    }

    const phonePairs = getBrazilPhonePairs(cleanPhone);

    // 2. Pausar Atendimento do Bot
    if (action === 'pause') {
      const data = {
        phone: cleanPhone,
        paused: true,
        pausedAt: Date.now(),
        reason,
        updatedAt: serverTimestamp()
      };
      
      // Salvar todas as variações (12 e 13 dígitos) no Firestore
      await Promise.all(phonePairs.map(p => setDoc(doc(db, 'paused_chats', p), { ...data, phone: p }, { merge: true })));

      // Notificar Moto G60 em tempo real via túnel
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 3500);
        await fetch(`${tunnelBase.replace(/\/+$/, '')}/api/pause-chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: 'ghost_ota_2026',
            phone: cleanPhone,
            action: 'pause',
            reason
          }),
          signal: ctrl.signal
        });
        clearTimeout(t);
      } catch (e) {
        console.warn('Aviso: Moto G60 não respondeu ao pause-chat imediatamente:', e.message);
      }

      return res.status(200).json({
        success: true,
        action: 'pause',
        phone: cleanPhone,
        message: `Atendimento automático da IA pausado com sucesso para +${cleanPhone}.`
      });
    }

    // 3. Reativar Atendimento do Bot
    if (action === 'unpause' || action === 'resume' || action === 'reativar') {
      await Promise.all(phonePairs.map(p => deleteDoc(doc(db, 'paused_chats', p))));

      // Notificar Moto G60 em tempo real via túnel
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 3500);
        await fetch(`${tunnelBase.replace(/\/+$/, '')}/api/pause-chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: 'ghost_ota_2026',
            phone: cleanPhone,
            action: 'unpause'
          }),
          signal: ctrl.signal
        });
        clearTimeout(t);
      } catch (e) {
        console.warn('Aviso: Moto G60 não respondeu ao unpause-chat imediatamente:', e.message);
      }

      return res.status(200).json({
        success: true,
        action: 'unpause',
        phone: cleanPhone,
        message: `Atendimento automático da IA reativado com sucesso para +${cleanPhone}.`
      });
    }

    return res.status(400).json({ error: 'Ação desconhecida. Use pause, unpause ou list.' });
  } catch (error) {
    console.error('Erro no pause-chat handler:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
