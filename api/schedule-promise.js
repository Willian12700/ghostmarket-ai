import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, deleteDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const tunnelBase = process.env.MOTO_G60_TUNNEL_URL || 'https://preceding-notifications-meal-dollar.trycloudflare.com';

  try {
    await ensureAuth();

    // 1. GET: Retorna todas as promessas (Firestore + Moto G60)
    if (req.method === 'GET') {
      const promisesMap = {};

      // Do Firestore
      try {
        const snap = await getDocs(collection(db, 'scheduled_promises'));
        snap.docs.forEach(d => {
          promisesMap[d.id] = { id: d.id, ...d.data() };
        });
      } catch (e) {
        console.warn('Erro ao ler Firestore scheduled_promises:', e.message);
      }

      // Do Moto G60
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 3500);
        const motoRes = await fetch(`${tunnelBase.replace(/\/+$/, '')}/api/promises`, { signal: ctrl.signal });
        clearTimeout(t);
        if (motoRes.ok) {
          const motoData = await motoRes.json();
          if (motoData.promises) {
            Object.values(motoData.promises).forEach(p => {
              if (p && p.id) {
                promisesMap[p.id] = { ...(promisesMap[p.id] || {}), ...p };
              }
            });
          }
        }
      } catch (_) {}

      const items = Object.values(promisesMap).sort((a, b) => (a.isoDate || '').localeCompare(b.isoDate || ''));
      return res.status(200).json({
        success: true,
        total: items.length,
        pendingCount: items.filter(p => p.status === 'pending').length,
        items
      });
    }

    // 2. POST: Ações (create, update_status, trigger_now, delete)
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const action = body.action || 'create';

      // Forward para Moto G60
      let motoResponse = null;
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 5000);
        const forwardRes = await fetch(`${tunnelBase.replace(/\/+$/, '')}/api/schedule-promise`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: 'ghost_ota_2026', ...body }),
          signal: ctrl.signal
        });
        clearTimeout(t);
        if (forwardRes.ok) {
          motoResponse = await forwardRes.json();
        }
      } catch (err) {
        console.warn('Moto G60 indisponível para schedule-promise:', err.message);
      }

      if (action === 'create') {
        const cleanPhone = String(body.phone || '').replace(/\D/g, '');
        if (!cleanPhone || !body.isoDate) {
          return res.status(400).json({ error: 'phone e isoDate são obrigatórios' });
        }
        const id = body.id || `promise_${cleanPhone}_${body.isoDate}`;
        const entry = {
          id,
          phone: cleanPhone,
          jid: `${cleanPhone}@s.whatsapp.net`,
          senderName: body.senderName || 'Lead Interessado',
          isoDate: body.isoDate,
          formatted: body.formatted || body.isoDate,
          leadMessage: body.leadMessage || 'Agendamento manual via Painel',
          status: 'pending',
          offer: body.offer || 'vitalicio',
          createdAt: Date.now(),
          remindedAt: null,
          convertedAt: null
        };

        try {
          await setDoc(doc(db, 'scheduled_promises', id), entry);
        } catch (e) {
          console.warn('Erro ao salvar no Firestore:', e.message);
        }

        return res.status(200).json({
          success: true,
          promise: entry,
          motoSynced: Boolean(motoResponse?.success)
        });
      }

      if (action === 'update_status') {
        const { id, status } = body;
        if (!id || !status) {
          return res.status(400).json({ error: 'id e status são obrigatórios' });
        }
        const updateData = { status };
        if (status === 'converted') updateData.convertedAt = Date.now();
        if (status === 'reminded') updateData.remindedAt = Date.now();

        try {
          await updateDoc(doc(db, 'scheduled_promises', id), updateData);
        } catch (e) {
          console.warn('Erro updateDoc Firestore:', e.message);
        }

        return res.status(200).json({
          success: true,
          id,
          status,
          motoSynced: Boolean(motoResponse?.success)
        });
      }

      if (action === 'trigger_now') {
        const { id } = body;
        if (!id) {
          return res.status(400).json({ error: 'id é obrigatório' });
        }

        try {
          await updateDoc(doc(db, 'scheduled_promises', id), {
            status: 'reminded',
            remindedAt: Date.now()
          });
        } catch (_) {}

        return res.status(200).json({
          success: true,
          id,
          reminded: true,
          motoDispatched: Boolean(motoResponse?.success)
        });
      }

      if (action === 'delete') {
        const { id } = body;
        if (!id) {
          return res.status(400).json({ error: 'id é obrigatório' });
        }

        try {
          await deleteDoc(doc(db, 'scheduled_promises', id));
        } catch (_) {}

        return res.status(200).json({
          success: true,
          id,
          deleted: true,
          motoSynced: Boolean(motoResponse?.success)
        });
      }

      return res.status(400).json({ error: 'Ação desconhecida' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Erro na API schedule-promise:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
