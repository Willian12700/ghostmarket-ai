import { create } from 'zustand'
import { db } from '@/config/firebase'
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'

export type CRMStatus = 'Lead' | 'Contato' | 'Proposta' | 'Fechado'

export interface Contract {
  id: string
  client: string
  amount: number
  date: string
  status: CRMStatus
  userId: string
  phone?: string
  instagram?: string
  city?: string
}

interface ContractState {
  contracts: Contract[]
  isSynced: boolean
  syncContracts: (userId: string) => () => void // Returns unsubscribe function
  addContract: (userId: string, contract: Omit<Contract, 'id' | 'userId'>) => Promise<void>
  updateContract: (id: string, data: Partial<Omit<Contract, 'id' | 'userId'>>) => Promise<void>
  deleteContract: (id: string) => Promise<void>
}

export const useContractStore = create<ContractState>()((set) => ({
  contracts: [],
  isSynced: false,

  syncContracts: (userId) => {
    const q = query(
      collection(db, 'crm_contracts'),
      where('userId', '==', userId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contract))
      set({ contracts: txs, isSynced: true })
    })

    return unsubscribe
  },

  addContract: async (userId, contract) => {
    await addDoc(collection(db, 'crm_contracts'), {
      ...contract,
      userId,
      createdAt: serverTimestamp()
    })
  },

  updateContract: async (id, data) => {
    await updateDoc(doc(db, 'crm_contracts', id), data)
  },

  deleteContract: async (id) => {
    await deleteDoc(doc(db, 'crm_contracts', id))
  }
}))
