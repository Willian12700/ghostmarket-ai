import { create } from 'zustand'
import { db } from '@/config/firebase'
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore'

export type CRMStatus = 'Lead' | 'Contato' | 'Proposta' | 'Fechado'

export interface DigitalizaContract {
  id: string
  client: string
  amount: number
  date: string
  status: CRMStatus
  addedByEmail: string
  addedByName: string
  phone?: string
  instagram?: string
  city?: string
}

interface DigitalizaState {
  contracts: DigitalizaContract[]
  isSynced: boolean
  syncContracts: () => () => void // Returns unsubscribe function
  addContract: (contract: Omit<DigitalizaContract, 'id'>) => Promise<void>
  updateContract: (id: string, data: Partial<Omit<DigitalizaContract, 'id'>>) => Promise<void>
  deleteContract: (id: string) => Promise<void>
}

export const useDigitalizaStore = create<DigitalizaState>()((set) => ({
  contracts: [],
  isSynced: false,

  syncContracts: () => {
    // Shared collection for everyone in Digitaliza
    const q = query(
      collection(db, 'digitaliza_crm'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DigitalizaContract))
      set({ contracts: txs, isSynced: true })
    })

    return unsubscribe
  },

  addContract: async (contract) => {
    await addDoc(collection(db, 'digitaliza_crm'), {
      ...contract,
      createdAt: serverTimestamp()
    })
  },

  updateContract: async (id, data) => {
    await updateDoc(doc(db, 'digitaliza_crm', id), data)
  },

  deleteContract: async (id) => {
    await deleteDoc(doc(db, 'digitaliza_crm', id))
  }
}))
