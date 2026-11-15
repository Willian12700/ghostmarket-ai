import { create } from 'zustand';
import { db } from '@/config/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';

export interface ClientSubscription {
  id: string;
  userId: string;
  clientName: string;
  phone: string;
  serviceName: string; // ex: 'Hospedagem & Manutenção de Site'
  amount: number; // ex: 99.00
  dueDay: number; // dia do mês (1 a 31)
  pixKey?: string;
  pixReceiverName?: string;
  notes?: string;
  lastPaymentDate?: string; // Data ISO do último pagamento (ex: '2026-11-10')
  status: 'active' | 'paused' | 'cancelled';
  createdAt?: any;
}

export interface UserPixSettings {
  pixKey: string;
  pixType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  pixReceiverName: string;
}

interface SubscriptionState {
  subscriptions: ClientSubscription[];
  pixSettings: UserPixSettings;
  isSynced: boolean;
  syncSubscriptions: (userId: string) => () => void;
  loadPixSettings: (userId: string) => Promise<void>;
  savePixSettings: (userId: string, settings: UserPixSettings) => Promise<void>;
  addSubscription: (userId: string, sub: Omit<ClientSubscription, 'id' | 'userId'>) => Promise<string>;
  updateSubscription: (id: string, data: Partial<Omit<ClientSubscription, 'id' | 'userId'>>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  markAsPaid: (id: string, paymentDateIso?: string) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>()((set) => ({
  subscriptions: [],
  pixSettings: {
    pixKey: '',
    pixType: 'cpf',
    pixReceiverName: ''
  },
  isSynced: false,

  syncSubscriptions: (userId: string) => {
    if (!userId) return () => {};

    const q = query(
      collection(db, 'client_subscriptions'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ClientSubscription));
        set({ subscriptions: list, isSynced: true });
      },
      (err) => {
        console.warn('client_subscriptions listener error:', err);
      }
    );

    return unsubscribe;
  },

  loadPixSettings: async (userId: string) => {
    if (!userId) return;
    try {
      const snap = await getDoc(doc(db, 'user_pix_settings', userId));
      if (snap.exists()) {
        set({ pixSettings: snap.data() as UserPixSettings });
      } else {
        // Fallback local storage
        const local = localStorage.getItem(`ghost_pix_${userId}`);
        if (local) {
          try {
            set({ pixSettings: JSON.parse(local) });
          } catch (_) {}
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar pixSettings:', e);
    }
  },

  savePixSettings: async (userId: string, settings: UserPixSettings) => {
    set({ pixSettings: settings });
    try {
      localStorage.setItem(`ghost_pix_${userId}`, JSON.stringify(settings));
      await setDoc(doc(db, 'user_pix_settings', userId), settings, { merge: true });
    } catch (e) {
      console.warn('Erro ao salvar pixSettings no Firestore:', e);
    }
  },

  addSubscription: async (userId: string, sub) => {
    const docRef = await addDoc(collection(db, 'client_subscriptions'), {
      ...sub,
      userId,
      status: sub.status || 'active',
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  updateSubscription: async (id: string, data) => {
    await updateDoc(doc(db, 'client_subscriptions', id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  deleteSubscription: async (id: string) => {
    await deleteDoc(doc(db, 'client_subscriptions', id));
  },

  markAsPaid: async (id: string, paymentDateIso?: string) => {
    const today = paymentDateIso || new Date().toISOString().split('T')[0];
    await updateDoc(doc(db, 'client_subscriptions', id), {
      lastPaymentDate: today,
      updatedAt: serverTimestamp()
    });
  }
}));
