import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, serverTimestamp } from 'firebase/firestore';
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

// Encaminha o lead do Quiz diretamente para a fila do Jarvis no Moto G60
async function forwardQuizLeadToJarvis(leadData) {
  const tunnelBase = process.env.MOTO_G60_TUNNEL_URL || 'https://preceding-notifications-meal-dollar.trycloudflare.com';
  const targetUrl = `${tunnelBase.replace(/\/+$/, '')}/api/cakto-event`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ghost-secret': 'ghost_ota_2026'
      },
      body: JSON.stringify({
        secret: 'ghost_ota_2026',
        eventType: 'quiz_completed',
        ...leadData
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    return response.ok;
  } catch (err) {
    console.warn(`[Quiz Lead Forward] Moto G60 inacessível (${err.message}).`);
    return false;
  }
}

export default async function handler(req, res) {
  // Configurar CORS para chamadas do frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-ghost-secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await ensureAuth();

    // 1. GET ?action=sync - Varredura de leads do Quiz concluídos que ainda não foram contatados
    if (req.method === 'GET' && req.query.action === 'sync') {
      const q = query(
        collection(db, 'quiz_sessions'),
        where('status', '==', 'Concluído'),
        limit(50)
      );
      const snap = await getDocs(q);
      const pendingLeads = [];

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (data.phone && !data.jarvis_contacted) {
          const cleanPhone = formatBrazilPhone(data.phone);
          if (cleanPhone.length >= 10) {
            pendingLeads.push({
              sessionId: docSnap.id,
              customerName: data.name || 'Participante',
              customerPhone: cleanPhone,
              score: data.score || 0,
              profile: data.profile || 'Iniciante',
              bottleneck: data.bottleneck || 'Atrair clientes'
            });
          }
        }
      }

      const dispatched = [];
      for (const lead of pendingLeads) {
        const ok = await forwardQuizLeadToJarvis(lead);
        if (ok) {
          await updateDoc(doc(db, 'quiz_sessions', lead.sessionId), {
            jarvis_contacted: true,
            jarvis_contacted_at: serverTimestamp()
          });
          dispatched.push(lead.sessionId);
        }
      }

      return res.status(200).json({
        success: true,
        totalPending: pendingLeads.length,
        dispatchedCount: dispatched.length,
        dispatched
      });
    }

    // 2. POST - Disparo imediato de um lead individual que acabou de finalizar o quiz
    if (req.method === 'POST') {
      const { sessionId, name, phone, score, profile, bottleneck } = req.body || {};
      const cleanPhone = formatBrazilPhone(phone);

      if (!cleanPhone || cleanPhone.length < 10) {
        return res.status(400).json({ error: 'Telefone inválido ou não informado' });
      }

      const leadPayload = {
        sessionId: sessionId || '',
        customerName: name || 'Participante',
        customerPhone: cleanPhone,
        score: score || 0,
        profile: profile || 'Iniciante',
        bottleneck: bottleneck || 'Atrair clientes'
      };

      // Encaminhar para o Moto G60
      const forwardOk = await forwardQuizLeadToJarvis(leadPayload);

      // Atualizar status no Firestore se sessionId fornecido
      if (sessionId) {
        try {
          await updateDoc(doc(db, 'quiz_sessions', sessionId), {
            jarvis_contacted: true,
            jarvis_contacted_at: serverTimestamp(),
            jarvis_dispatched: forwardOk
          });
        } catch (e) {
          console.warn('Erro ao atualizar status jarvis_contacted:', e.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Lead do quiz encaminhado com sucesso para o Jarvis',
        forwardedToJarvis: forwardOk,
        lead: leadPayload
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('Erro no endpoint quiz-lead:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
