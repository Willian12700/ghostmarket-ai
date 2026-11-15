import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const tunnelBase = process.env.MOTO_G60_TUNNEL_URL || 'https://preceding-notifications-meal-dollar.trycloudflare.com';

  try {
    await ensureAuth();

    // 1. Buscar Testes Grátis no Firestore
    let trialCodes = [];
    try {
      const snap = await getDocs(query(collection(db, 'trial_codes'), limit(50)));
      trialCodes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Erro ao ler trial_codes:', e.message);
    }

    // 2. Buscar Telefones Bloqueados / Usados
    let usedTrialsCount = 0;
    try {
      const snapUsed = await getDocs(query(collection(db, 'trial_requests'), limit(150)));
      usedTrialsCount = snapUsed.docs.length;
    } catch (_) {}

    // 3. Buscar Leads do Quiz Concluídos
    let quizLeads = [];
    try {
      const snapQuiz = await getDocs(query(collection(db, 'quiz_sessions'), limit(60)));
      quizLeads = snapQuiz.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(s => s.status === 'Concluído' && s.phone);
    } catch (e) {
      console.warn('Erro ao ler quiz_sessions:', e.message);
    }

    // 4. Buscar Transações e Vendas
    let transactions = [];
    try {
      const snapTx = await getDocs(query(collection(db, 'transactions'), limit(40)));
      transactions = snapTx.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (_) {}

    // 5. Buscar Chats Pausados no Firestore
    let pausedChats = {};
    try {
      const snapPaused = await getDocs(collection(db, 'paused_chats'));
      snapPaused.docs.forEach(d => {
        pausedChats[d.id] = d.data();
      });
    } catch (_) {}

    // 6. Consultar Moto G60 em tempo real (Status, Leads do WhatsApp, Pausados e Logs)
    let motoG60Online = false;
    let motoStatus = null;
    let whatsappLeads = {};
    let systemLogs = { outContent: '', errContent: '' };

    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 3500);

      const [resStatus, resLeads, resLogs, resPaused] = await Promise.allSettled([
        fetch(`${tunnelBase.replace(/\/+$/, '')}/api/status`, { signal: ctrl.signal }),
        fetch(`${tunnelBase.replace(/\/+$/, '')}/api/leads`, { signal: ctrl.signal }),
        fetch(`${tunnelBase.replace(/\/+$/, '')}/api/logs`, { signal: ctrl.signal }),
        fetch(`${tunnelBase.replace(/\/+$/, '')}/api/paused-chats`, { signal: ctrl.signal })
      ]);
      clearTimeout(t);

      if (resStatus.status === 'fulfilled' && resStatus.value.ok) {
        motoStatus = await resStatus.value.json();
        motoG60Online = true;
      }
      if (resLeads.status === 'fulfilled' && resLeads.value.ok) {
        const d = await resLeads.value.json();
        whatsappLeads = d.leads || {};
      }
      if (resLogs.status === 'fulfilled' && resLogs.value.ok) {
        systemLogs = await resLogs.value.json();
      }
      if (resPaused.status === 'fulfilled' && resPaused.value.ok) {
        const p = await resPaused.value.json();
        if (p.pausedChats) {
          pausedChats = { ...pausedChats, ...p.pausedChats };
        }
      }
    } catch (err) {
      console.warn('Moto G60 inacessível no momento:', err.message);
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      sentinel: {
        online: motoG60Online,
        tunnelUrl: tunnelBase,
        status: motoStatus,
        whatsappAccount: {
          name: 'Queens Technology (Jarvis)',
          phone: '558496162332'
        }
      },
      pausedChats: {
        total: Object.keys(pausedChats).length,
        items: pausedChats
      },
      whatsappLeads: {
        total: Object.keys(whatsappLeads).length,
        items: whatsappLeads
      },
      trials: {
        totalGenerated: trialCodes.length,
        totalUsedNumbers: usedTrialsCount,
        items: trialCodes
      },
      quiz: {
        totalCompletedWithPhone: quizLeads.length,
        items: quizLeads
      },
      finance: {
        totalTransactions: transactions.length,
        items: transactions
      },
      logs: systemLogs
    });
  } catch (error) {
    console.error('Erro no jarvis-hub:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
